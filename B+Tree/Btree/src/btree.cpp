/**
 * @author See Contributors.txt for code contributors and overview of BadgerDB.
 *
 * @section LICENSE
 * Copyright (c) 2012 Database Group, Computer Sciences Department, University of Wisconsin-Madison.
 */
/**
 *
 *names: Aaron Wendt(9071165196), Alex Meng(9078161016), Fangzhou Cheng(9080623813)
 *
 *
**/
#include "btree.h"
#include "filescan.h"
#include "exceptions/bad_index_info_exception.h"
#include "exceptions/bad_opcodes_exception.h"
#include "exceptions/bad_scanrange_exception.h"
#include "exceptions/no_such_key_found_exception.h"
#include "exceptions/scan_not_initialized_exception.h"
#include "exceptions/index_scan_completed_exception.h"
#include "exceptions/file_not_found_exception.h"
#include "exceptions/end_of_file_exception.h"
#include "exceptions/page_not_pinned_exception.h"
#include "exceptions/hash_not_found_exception.h"
#include "exceptions/bad_scanrange_exception.h"
#include "exceptions/bad_opcodes_exception.h"
#include <string>


//#define DEBUG

namespace badgerdb
{

// -----------------------------------------------------------------------------
// BTreeIndex::BTreeIndex -- Constructor
// -----------------------------------------------------------------------------

BTreeIndex::BTreeIndex(const std::string & relationName,
		std::string & outIndexName,
		BufMgr *bufMgrIn,
		const int attrByteOffset,
		const Datatype attrType)
{
	bufMgr = bufMgrIn;
	//scanExecuting = false;
	leafOccupancy = INTARRAYLEAFSIZE;
	nodeOccupancy = INTARRAYNONLEAFSIZE;

	//get the index name
	std::ostringstream idxStr;
	idxStr << relationName << '.' << attrByteOffset;
	std::string indexName = idxStr.str();
	outIndexName = indexName;

	Page* mdpage;
	//IndexMetaInfo* md;
	PageId mdNum = 1;
	//BlobFile* bfile;

	try
	{
		file = new BlobFile(outIndexName, false);
		//file = (File*)bfile;
		headerPageNum = mdNum;

		bufMgr->readPage(file, mdNum, mdpage);

		rootPageNum = ((IndexMetaInfo *)(mdpage))->rootPageNo;

		attributeType = attrType;
		this->attrByteOffset = attrByteOffset;
		
		bufMgr->unPinPage(file, mdNum, false);
	}
	catch(FileNotFoundException e)
	{
		file = new BlobFile(outIndexName, true);
		//file = (File*)bfile;

		Page * node;
		PageId nodePageNo;

		bufMgr->allocPage(file, mdNum, mdpage);
		bufMgr->allocPage(file, nodePageNo, node);

		struct IndexMetaInfo* md = (IndexMetaInfo *)mdpage;

		attributeType = attrType;
		this->attrByteOffset = attrByteOffset;

		headerPageNum = mdNum;
		rootPageNum = nodePageNo;

		//set metadata
		strncpy((char*)&(md->relationName),(const char*)&relationName, 20);
		md->attrByteOffset = attrByteOffset;
		md->attrType = attrType;
		md->rootPageNo = nodePageNo;

		FileScan* scan = new FileScan(relationName, bufMgr);
		RecordId rid;

		try
		{
			((LeafNodeInt *)(node))->level = 0;
			((LeafNodeInt *)(node))->slotsInUse = 0;
				
			int *key = new int;

			while(true)
			{
				std::string ret;
				scan->scanNext(rid);
				ret = scan->getRecord();

				key = (int *)&ret[0]+attrByteOffset;
				insertEntry(key, rid);
			}
			bufMgr->unPinPage(file, mdNum, true);
			bufMgr->unPinPage(file, nodePageNo, true);
			
		}
		catch(EndOfFileException e)
		{
			bufMgr->unPinPage(file, mdNum, true);
			bufMgr->unPinPage(file, nodePageNo, true);
		}
		delete scan;
	}	
}


// -----------------------------------------------------------------------------
// BTreeIndex::~BTreeIndex -- destructor
// -----------------------------------------------------------------------------

BTreeIndex::~BTreeIndex()
{
	scanExecuting = false;
	bufMgr->flushFile(file);
	delete file;
	file = nullptr;
}

const void BTreeIndex::insertion(void *old, const void *key, void *nId, int isleaf)
{
	if(isleaf != 0) //check if leaf node or not
	{
			//nonleaf node
			struct NonLeafNodeInt *node = (NonLeafNodeInt *)old;
			int temp = node->keyArray[0];
			int inSpot = -1;
			PageId ptemp = node->pageNoArray[0];
			int nkey = *(int *)key;
			PageId pid = *(PageId *)nId;

			//Any value greater than the key is shifted to the right
			for(int i = 0; i <= node->slotsInUse; i++)
			{
				if(node->keyArray[i] > nkey || i == node->slotsInUse)
				{
					temp = node->keyArray[i];
					node->keyArray[i] = nkey;
					nkey = temp;
					if(inSpot == -1)
					{
						inSpot = i;
					}
				}
			}
			for(int j = (inSpot+1); j <= node->slotsInUse + 1; j++)
			{
				ptemp = node->pageNoArray[j];
				node->pageNoArray[j] = pid;
				pid = ptemp;
			}
	}
	else
	{
			//leafnodes
			struct LeafNodeInt *node = (LeafNodeInt *)old;
			int temp = 0;
			int inSpot = -1;
			RecordId rtemp = node->ridArray[0];
			int nkey = *(int *)key;
			RecordId rid = *(RecordId *)nId;

			//searches for spot to place key value
			for(int i = 0; i <= node->slotsInUse; i++)
			{
				if(nkey < node->keyArray[i] || i == node->slotsInUse)
				{
					temp = node->keyArray[i];
					node->keyArray[i] = nkey;
					nkey = temp;
					if(inSpot == -1)
					{
						inSpot = i;
					}
				}
			}
			for(int j = inSpot; j <= node->slotsInUse; j++)
			{
				rtemp = node->ridArray[j];
				node->ridArray[j] = rid;
				rid = rtemp;
			}
	}
}

PageId BTreeIndex::findNode(const void *key, const RecordId rid, PageId pid, void *midKey)
{
	Page* node;
	bufMgr->readPage(file, pid, node);
	struct NonLeafNodeInt *leafcheck = (NonLeafNodeInt *)node;

	PageId returned = 0;

	if(leafcheck->level == 0) //leaf node
	{
			struct LeafNodeInt *leaf = (LeafNodeInt *)node;

			if(leaf->slotsInUse < leafOccupancy) //leaf found and not full
			{
				insertion(leaf, key, (void*)&rid, leaf->level);
				(leaf->slotsInUse)++;
				returned = 0;
				bufMgr->unPinPage(file, pid, true);
				return returned;
			}
			else //leaf found, but full and must be split
			{
				Page *secondNode;
				PageId secondPID = 0;
				
				bufMgr->allocPage(file, secondPID, secondNode);
				struct LeafNodeInt *newleaf = (LeafNodeInt *)secondNode;

				//set the attributes for the new node
				newleaf->rightSibPageNo = leaf->rightSibPageNo;
				leaf->rightSibPageNo = secondPID;
				newleaf->level = 0;
				newleaf->slotsInUse = 0;
				
				//the middle value of the node
				int* midKeyVal = (int *)midKey;
				*midKeyVal = leaf->keyArray[(leafOccupancy/2 - 1)]; //used to determine where to split
				returned = secondPID;

				//create two new nodes and split the old keys
				for(int i = 0; i < leafOccupancy; i++)
				{
					if(i >= (leafOccupancy/2 - 1))
					{
						insertion(newleaf, (void *)&(leaf->keyArray[i]), (void *)&(leaf->ridArray[i]), leaf->level);
						leaf->keyArray[i] = 0;
						leaf->slotsInUse--;
						newleaf->slotsInUse++;
					}
				}

				//insert the new key
				if(*(int *)key <= *(int *)midKey)
				{
					insertion(leaf, key, (void *)&rid, leaf->level);
					leaf->slotsInUse++;
				}
				else
				{
					insertion(newleaf, key, (void *)&rid, newleaf->level);
					newleaf->slotsInUse++;
				}

				bufMgr->unPinPage(file, secondPID, true);
				bufMgr->unPinPage(file, pid, true);
				return returned;
			}			
	}
	else //nonleaf node
	{
			PageId found = 0;
			if(*(int *)key < (leafcheck->keyArray[0])) //front end case
			{
				found = leafcheck->pageNoArray[0];
			}
			else if(*(int *)key > (leafcheck->keyArray[leafcheck->slotsInUse-1])) //back end case
			{
				found = leafcheck->pageNoArray[leafcheck->slotsInUse];
			}
			else
			{
				for(int i = 1; i < (leafcheck->slotsInUse); i++)
				{
					if(i == ((leafcheck->slotsInUse) - 1))
					{
						if(*(int *)key > leafcheck->keyArray[i])
						{
							found = leafcheck->pageNoArray[i+1];
							break;
						}
					}

					if(*(int *)key < leafcheck->keyArray[i] && *(int *)key >= leafcheck->keyArray[i - 1])
					{
						found = leafcheck->pageNoArray[i];
						break;
					}
				}
			}

			bufMgr->unPinPage(file, pid, false);
			returned = findNode(key, rid, found, midKey);

			if(returned != 0)
			{
				bufMgr->readPage(file, pid, node);
				struct NonLeafNodeInt *splitNode = (NonLeafNodeInt *)node;

				//insert if there is already space
				if(splitNode->slotsInUse < nodeOccupancy)
				{
					insertion(splitNode, midKey, (void *)&returned, splitNode->level);
					(splitNode->slotsInUse)++;
					returned = 0;
					bufMgr->unPinPage(file, pid, true);
					return returned;
				}
				else
				{
					Page *newNode;
					PageId nLeafId = 0;
					bufMgr->allocPage(file, nLeafId, newNode);
					struct NonLeafNodeInt *newNLeaf = (NonLeafNodeInt *)newNode;

					//give values to new leaf
					newNLeaf->level = splitNode->level;
					newNLeaf->slotsInUse = 0;

					//middle value of node
					midKey = &(splitNode->keyArray[(nodeOccupancy/2 - 1)]);
					returned = nLeafId;

				 /*	for(int i = 0; i < nodeOccupancy; i++)
					{
						if(i >= nodeOccupancy/2 - 1)
						{
							insertion(newNLeaf, (void *)&(splitNode->keyArray[i]), (void *)&(splitNode->pageNoArray[i]), splitNode->level);
							newNLeaf->slotsInUse++;
							splitNode->slotsInUse--;
						}
					}*/

					//seperate keys between the two nodes
					for(int i = 0; i < nodeOccupancy; i++)
					{
						if(i >= nodeOccupancy/2 - 1)
						insertion(newNLeaf, (void *)&(splitNode->keyArray[i]), (void *)&(splitNode->pageNoArray[i]), splitNode->level);
						newNLeaf->slotsInUse++;
						splitNode->slotsInUse--;
					}

					if(*(int *)key <= *(int *)midKey)
					{
						insertion(splitNode, midKey, (void *)&returned, splitNode->level);
						splitNode->slotsInUse++;
					}
					else
					{
						insertion(newNLeaf, midKey, (void *)&returned, newNLeaf->level);
						newNLeaf->slotsInUse++;
					}
					bufMgr->unPinPage(file, nLeafId, true);
					bufMgr->unPinPage(file, pid, true);
					return returned;
				}
			}
			else
			{
				return returned;
			}
	}
}

int top = 0;
const void BTreeIndex::insertEntry(const void *key, const RecordId rid) 
{
	PageId returned = 0;
	void *midKey = new int;

	returned = findNode(key, rid, rootPageNum, midKey);

	//check if there was a split, and set up new root if there was
	if(returned != 0)
	{
		top++;
		Page *head;
		Page *root2;
		PageId root2num;

		bufMgr->allocPage(file, root2num, root2);

		struct NonLeafNodeInt *root = (NonLeafNodeInt *)root2;
		root->keyArray[0] = *((int *)midKey);
		root->slotsInUse = 1;
		root->level = top;
		root->pageNoArray[0] = rootPageNum;
		root->pageNoArray[1] = returned;
			
	
		rootPageNum = root2num;
		bufMgr->readPage(file, headerPageNum, head);
		struct IndexMetaInfo* test = (IndexMetaInfo *)head;
		test->rootPageNo = root2num;
		bufMgr->unPinPage(file, headerPageNum, true);
		bufMgr->unPinPage(file, root2num, true);
	}		
}

// -----------------------------------------------------------------------------
// BTreeIndex::startScan
// -----------------------------------------------------------------------------

int curRid = 0;
bool scanDone = false;
const void BTreeIndex::startScan(const void* lowValParm,
				   const Operator lowOpParm,
				   const void* highValParm,
				   const Operator highOpParm)
{
		lowValInt = *(int *)lowValParm;
		highValInt = *(int *)highValParm;
		scanDone = false;

		//checks that the boundarys of the low/high vals are met
		if(highValInt < lowValInt)
		{
			scanExecuting = false;
			throw BadScanrangeException();
		}
		else if(lowOpParm == LTE || lowOpParm == LT)
		{
			scanExecuting = false;
			throw BadOpcodesException();
		}
		else if(highOpParm == GTE || highOpParm == GT)
		{
			scanExecuting = false;
			throw BadOpcodesException();
		}

		highOp = highOpParm;
		lowOp = lowOpParm;

		scanExecuting = true;
		currentPageNum = rootPageNum;

		bool notFound = true;
		while(notFound)
		{
			bufMgr->readPage(file, currentPageNum, currentPageData);
			struct NonLeafNodeInt *nLeaf = (NonLeafNodeInt *)currentPageData;

			if(nLeaf->level != 0) //nonleaf node
			{
				PageId old = currentPageNum;

				//find the correct spot for begin of range search, checking edge cases first
				if(nLeaf->keyArray[0] > lowValInt)
				{
					currentPageNum = nLeaf->pageNoArray[0];
				}
				else if(nLeaf->keyArray[nLeaf->slotsInUse - 1] <= lowValInt)
				{
					currentPageNum = nLeaf->pageNoArray[nLeaf->slotsInUse];
				}
				else
				{
					for(int i = 0; i < nLeaf->slotsInUse; i++)
					{
						if(nLeaf->keyArray[i] >= lowValInt)
						{
							currentPageNum = nLeaf->pageNoArray[i];
							break;
						}
					}
				}
				bufMgr->unPinPage(file, old, false);
			}
			else //leafnode
			{
				struct LeafNodeInt *leaf = (LeafNodeInt *)currentPageData;

				for(int i = 0; i < leaf->slotsInUse; i++)
				{
					if(leaf->keyArray[i] >= lowValInt)
					{
						if(lowOpParm == GTE || (lowOpParm == GT && leaf->keyArray[i] != lowValInt))
						{
							curRid = i;
							notFound = false;
							break;
						}
					}				
				}
				if(notFound)
				{
					scanDone = true;
					break;
				}
			}
		}
}

// -----------------------------------------------------------------------------
// BTreeIndex::scanNext
// -----------------------------------------------------------------------------

const void BTreeIndex::scanNext(RecordId& outRid) 
{
	if(!scanExecuting)
	{
		throw ScanNotInitializedException();
	}

		struct LeafNodeInt *leaf = (LeafNodeInt *)currentPageData;

		if(scanDone)
		{
			throw IndexScanCompletedException();
		}

		/*if(leaf->keyArray[curRid] <= highValInt)
		{
			if(highOp == LTE || (highOp == LT && leaf->keyArray[curRid] != highValInt))
			{
				outRid = leaf->ridArray[curRid];
			}
			else
			{
				throw IndexScanCompletedException();
			}
		}*/


		if(leaf->keyArray[curRid] <= highValInt && highOp == LTE)
		{
			outRid = leaf->ridArray[curRid];
		}
		else if(leaf->keyArray[curRid] < highValInt && highOp == LT)
		{
			outRid = leaf->ridArray[curRid];
		}
		else
		{
			throw IndexScanCompletedException();
		}

		if(curRid < leaf->slotsInUse - 1)
		{
			curRid++;
		}
		else
		{
			curRid = 0;
			PageId old = currentPageNum;
			currentPageNum = leaf->rightSibPageNo;
			bufMgr->unPinPage(file, old, false);

			try
			{
				if(currentPageNum == 0)
				{
					throw IndexScanCompletedException();
				}
				bufMgr->readPage(file, currentPageNum, currentPageData);
			}
			catch(IndexScanCompletedException e)
			{
				currentPageNum = 0;
				scanDone = true;
			}
	}
}

// -----------------------------------------------------------------------------
// BTreeIndex::endScan
// -----------------------------------------------------------------------------
//
const void BTreeIndex::endScan() 
{
	if(!scanExecuting)
	{
		throw ScanNotInitializedException();
	}
	scanExecuting = false;
	scanDone = true;
	bufMgr->unPinPage(file, currentPageNum, false);
	
}

}
