/**
 *authors: Aaron Wendt (9071165196), Alex Meng (9078161016), Fangzhou Cheng (netid: fcheng24)
 *
 *class: CS 564 Spring 2020
 *
 *purpose: buffer.cpp is where the bulk of the buffer manager is implemented. Allocates frames
 *based on clock algorithm, reads pages, flushes files, unpins pages, and disposes pages.
 */

/**
 * @author See Contributors.txt for code contributors and overview of BadgerDB.
 *
 * @section LICENSE
 * Copyright (c) 2012 Database Group, Computer Sciences Department, University of Wisconsin-Madison.
 */

#include <memory>
#include <iostream>
#include "buffer.h"
#include "exceptions/buffer_exceeded_exception.h"
#include "exceptions/page_not_pinned_exception.h"
#include "exceptions/page_pinned_exception.h"
#include "exceptions/bad_buffer_exception.h"
#include "exceptions/hash_not_found_exception.h"
#include "file_iterator.h"

namespace badgerdb { 

BufMgr::BufMgr(std::uint32_t bufs)
	: numBufs(bufs) {
	bufDescTable = new BufDesc[bufs];

  for (FrameId i = 0; i < bufs; i++) 
  {
  	bufDescTable[i].frameNo = i;
  	bufDescTable[i].valid = false;
  }

  bufPool = new Page[bufs];

	int htsize = ((((int) (bufs * 1.2))*2)/2)+1;
  hashTable = new BufHashTbl (htsize);  // allocate the buffer hash table

  clockHand = bufs - 1;
}


BufMgr::~BufMgr() 
{
	//flushes all dirty files
	for(std::uint32_t  i = 0; i < numBufs; i++)
	{
		if(bufDescTable[i].dirty == true && bufDescTable[i].valid == true)
		{
			flushFile(bufDescTable[i].file);
		}
	}
	
	delete [] bufPool;
	delete [] bufDescTable;
}

/**
*advances clockhand, and resets to zero when
*total buffers are reached
*/
void BufMgr::advanceClock()
{
	clockHand++;
	if(clockHand >= numBufs)
	{
		clockHand = 0;
	}
}

/**
*Uses clock algorithm to search for a valid frame. This frame is returned through
*the frame parameter. If all pages are pinned, a frame is not returned and a buffer
*exceeded extension is thrown.
*/
void BufMgr::allocBuf(FrameId & frame) 
{
	bool found = false; //used to break while loop when valid frame is found
	uint32_t allpin = 0; //used to break while loop if all pages are pinned

	//continues searching until a valid frame is found or
	//all pages have been detected as being pinned.
	while(allpin < numBufs && found == false)
	{
		if(bufDescTable[clockHand].valid == false)
		{
			found = true;
			frame = clockHand;
			bufDescTable[frame].Set(bufDescTable[frame].file, bufDescTable[frame].pageNo);
		}
		else
		{
			if(bufDescTable[clockHand].refbit == true)
			{
				bufDescTable[clockHand].refbit = false;
				advanceClock();
			}
			else
			{
				if(bufDescTable[clockHand].pinCnt != 0)
				{
					advanceClock();
					allpin++;
				}
				else
				{
					if(bufDescTable[clockHand].dirty == true)
					{
						flushFile(bufDescTable[clockHand].file);
					}
					else
					{
						hashTable->remove(bufDescTable[clockHand].file, bufDescTable[clockHand].pageNo);
					}
					frame = clockHand;
					found = true;
					bufDescTable[frame].Set(bufDescTable[frame].file, bufDescTable[frame].pageNo);
				}
			}
		}
	}
	if(found == false)
	{
		throw BufferExceededException();
	}
	
}

/**
*Reads a page from a file into a frame. It will return a pointer to a
*page through the variable page.
*/
void BufMgr::readPage(File* file, const PageId pageNo, Page*& page)
{
	FrameId frameNo;
	try
	{
		hashTable->lookup(file, pageNo, frameNo);//if page is not found, execute the 'catch' clause.

		//page found, so update reference bit and increase pin count
		bufDescTable[frameNo].refbit = true;
		bufDescTable[frameNo].pinCnt++;
		page = &bufPool[frameNo];
	}
	catch (HashNotFoundException e)
	{
		//page was not found, so find and allocate a new frame, read page into buffer pool,
		//add to hashtable, and properly set up the frame
		FrameId frame;
		allocBuf(frame);
		bufPool[frame] = file->readPage(pageNo);
		hashTable->insert(file, pageNo, frame);
		bufDescTable[frame].Set(file, pageNo);
		page = &bufPool[frame];
	}
}

/**
*decrements the pin count on a given page, if the page is not found,
*the exception is caught and nothing happens
*/
void BufMgr::unPinPage(File* file, const PageId pageNo, const bool dirty) 
{
	FrameId frameNo;

	try
	{
		hashTable->lookup(file, pageNo, frameNo);//make sure page is already in the hashtable

		//make sure the pin count is not zero, throw exception if it is not
		if(bufDescTable[frameNo].pinCnt > 0)
		{
			bufDescTable[frameNo].pinCnt = bufDescTable[frameNo].pinCnt - 1; //decrement pin count

			if(dirty == true) //set dirty bit if 'dirty' constant is true
			{
				bufDescTable[frameNo].dirty = true;
			}
		}
		else if(bufDescTable[frameNo].pinCnt == 0)
		{
			throw PageNotPinnedException(file->filename(), bufDescTable[frameNo].pageNo, frameNo);
		}
	} 
	catch(HashNotFoundException e){}
}

/**
*search for all pages contained within the given file. If any page that is found is dirty,
*write to disk.
*/
void BufMgr::flushFile(const File* file)
{
	for (std::uint32_t i = 0; i < numBufs; i++)
	{
		//if a page is invalid, throw a BadBufferException
		if(bufDescTable[i].valid == false && bufDescTable[i].file == file)
		{
			throw BadBufferException(bufDescTable[i].frameNo, bufDescTable[i].dirty, bufDescTable[i].valid, bufDescTable[i].refbit);
		}
		
		//If the page is still pinned, throw PagePinnedException
		if(bufDescTable[i].pinCnt > 0 && bufDescTable[i].file == file)
		{
			throw PagePinnedException(file->filename(), bufDescTable[i].pageNo, bufDescTable[i].frameNo);
		}
		
		//valid page encountered
		if(bufDescTable[i].valid == true && bufDescTable[i].file == file)
		{
			//if page is dirty, write to disk and reset dirty bit
			if(bufDescTable[i].dirty == true)
			{
				bufDescTable[i].file->writePage(bufPool[i]);
				bufDescTable[i].dirty = false;
			}
			
			hashTable->remove(bufDescTable[i].file, bufDescTable[i].pageNo); //remove valid page from hashtable
			bufDescTable[i].Clear(); //call clear to initialize the now empty buffer frame
		}
	}
}

/**
*Allocate a new page and assign it a buffer pool frame
*/
void BufMgr::allocPage(File* file, PageId &pageNo, Page*& page) 
{
	FrameId frameNo;

	allocBuf(frameNo); //find buffer pool frame
	bufPool[frameNo] = file->allocatePage(); //allocate the page with the returned frame
	page = &bufPool[frameNo]; //return the page object
	pageNo = page->page_number(); 

	//insert into hashtable and set up the newly allocated page
	hashTable->insert(file, pageNo, frameNo);
	bufDescTable[frameNo].Set(file, pageNo);	
}

/**
*deletes a page from a file
*/
void BufMgr::disposePage(File* file, const PageId PageNo)
{
    FrameId frameNo;
	
	//check to see if page is in hashtable, remove and clear if it is
	try
	{	
		hashTable->lookup(file, PageNo, frameNo);
		bufDescTable[frameNo].Clear();
		hashTable->remove(file, PageNo);
	}
	catch(HashNotFoundException e){};

	file->deletePage(PageNo); //delete the page
}

void BufMgr::printSelf(void) 
{
  BufDesc* tmpbuf;
	int validFrames = 0;
  
  for (std::uint32_t i = 0; i < numBufs; i++)
	{
  	tmpbuf = &(bufDescTable[i]);
		std::cout << "FrameNo:" << i << " ";
		tmpbuf->Print();

  	if (tmpbuf->valid == true)
    	validFrames++;
  }

	std::cout << "Total Number of Valid Frames:" << validFrames << "\n";
}

}
