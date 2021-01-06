/*jshint esversion: 6 */
// @ts-check

/**
 * Graphics Town Framework - "Main" File
 *
 * This is the main file - it creates the world, populates it with
 * objects and behaviors, and starts things running
 *
 * The initial distributed version has a pretty empty world.
 * There are a few simple objects thrown in as examples.
 *
 * It is the students job to extend this by defining new object types
 * (in other files), then loading those files as modules, and using this
 * file to instantiate those objects in the world.
 */

import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import * as Helpers from "../libs/CS559-Libs/helpers.js";
import { WorldUI } from "../libs/CS559-Framework/WorldUI.js";
import {House1, SkyScraper, Tree} from "./6-buildings.js";
import {Truck, Road} from "./7-car.js";
import {main} from "../examples/main.js";
import { Train1, Curve } from "./train.js";
import {GrCarousel, GrAdvancedSwing} from "./8-parkobjects.js";
import {UFO} from "./ufo.js";
import * as T from "../libs/CS559-THREE/build/three.module.js";
import { Sand, GrDump } from "./9-constructionobjects.js";
import * as SimpleObjects from "../libs/CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "../libs/CS559-Framework/shaderHelper.js";


function scale(grobj, factor)
{
  grobj.objects[0].scale.set(factor, factor, factor);
  return grobj;
}

function shift(grobj, x, y, z)
{
  grobj.objects[0].translateX(x);
  grobj.objects[0].translateY(y);
  grobj.objects[0].translateZ(z);
  return grobj;
}

function rotate(grobj, x)
{
  grobj.objects[0].rotateX(x*Math.PI/180);
  return grobj;
}

function rotatey(grobj, y)
{
  grobj.objects[0].rotateY(y*Math.PI/180);
  return grobj;
}

/**m
 * The Graphics Town Main -
 * This builds up the world and makes it go...
 */
function grtown() {

  let mydiv = document.getElementById("div1");
  // make the world
  let world = new GrWorld({
    width: 800,
    height: 600,
    groundplanesize: 23 // make the ground plane big enough for a world of stuff
  });

 // main(world);

  world.scene.background = new T.CubeTextureLoader().setPath('../images/Park3/').load([
    'posx.jpg',
    'negx.jpg',
    'posy.jpg',
    'negy.jpg',
    'posz.jpg',
    'negz.jpg'
  ]);

  // build and run the UI
  for(let i = 0; i < 8; i++)
  {
    let house = new House1();
    house = scale(house, 2);
    house = shift(house, -18.5 + i*5, 0, -19);
    world.add(house);
  }
  
  for(let i = 0; i < 7; i++)
  {
    let tree = new Tree();
    tree = scale(tree, 3);
    tree = shift(tree, -15 + i*5, 0, -18);

    world.add(tree);
  }

  for(let i = 0; i < 4; i++)
  {
    let skyscrape = new SkyScraper();
    skyscrape = scale(skyscrape, 3);
    world.add(skyscrape);

    if(i%2==0)
    {
      if(i == 0)
      {
        skyscrape = shift(skyscrape, -13, 0, -10);
      }
      else
      {
        skyscrape = shift(skyscrape, -8, 0, -10);
      }
      
    }
    else
    {
      if(i == 1)
      {
        skyscrape = shift(skyscrape, -13, 0, -5);
      }
      else
      {
        skyscrape = shift(skyscrape, -8, 0, -5);
      }
    }
  }

  let road = new Road();
  road = shift(road, 0, 0, 2.5);
  world.add(road);

  let train = new Train1();
  world.add(train);

  let curve = new Curve();
  world.add(curve);

  let carousel = new GrCarousel();
  carousel = scale(carousel, 0.7);
  carousel = shift(carousel, 3, 0, -5);
  world.add(carousel);

  let swing = new GrAdvancedSwing();
  swing = scale(swing, 1.5);
  swing = shift(swing, 10, 0, -5);
  world.add(swing);

  let truck = new Truck();
  truck = shift(truck, 0.4, 0, 0.2);
  world.add(truck);

  let ufo = new UFO();
  ufo = scale(ufo, 2);
  world.add(ufo);

 /* let sand = new Sand();
  sand = shift(sand, 0, 10);
  sand = rotate(sand, 90);
  
  world.add(sand);*/
  let image = new T.TextureLoader().load("../images/sand.png");
  let shaderMat = shaderMaterial("./shaders/sand.vs", "./shaders/sand.fs", {
    side: T.DoubleSide,
    uniforms: {
      colormap: {value: image},
      theta : {value: 0.2}
    },
  });

  let sand = new SimpleObjects.GrSquareSign({ x: -2, y: 1, material: shaderMat });
  sand = scale(sand, 10);
  sand = shift(sand, 0, 0.5, 15);
  sand = rotate(sand, 90);
  world.add(sand);

  let dump = new GrDump();
  dump = shift(dump, 0, 0, 10);
  dump = rotatey(dump, 45);
  world.add(dump);

  // only after all the objects exist can we build the UI
  // @ts-ignore       // we're sticking a new thing into the world
  world.ui = new WorldUI(world);
  // now make it go!

  world.ambient.intensity = 1;
  world.go();
}
Helpers.onWindowOnload(grtown);
