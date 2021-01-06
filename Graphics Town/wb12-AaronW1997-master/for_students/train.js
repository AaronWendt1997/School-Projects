/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-THREE/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";

/*let size = 40;
let height = 0.2;
let z = 0.5;
let segsnum = 30;
let bezier = [];
let points = [
    [-0.7*size,z,-0.7*size], 
    [0.7*size,z,-0.7*size], 
    [0.7*size,z,0.7*size], 
    [-0.7*size,z,0.7*size]
];
let derivs = [];
let arctable = [];*/


let points1 = [];
let points2 = [];
let points3 = [];
let points4 = [];

let curve1 = new T.CubicBezierCurve3(
            new T.Vector3(-15, 0, 18),
            new T.Vector3(-20, 0, 13),
            new T.Vector3(-20, 0, -5),
            new T.Vector3(-15, 0, -10)
);

let curve2 = new T.CubicBezierCurve3(
            new T.Vector3(-15, 0, -10),
            new T.Vector3(-10, 0, -15),
            new T.Vector3(10, 0, -15),
            new T.Vector3(15, 0, -10)
);

let curve3 = new T.CubicBezierCurve3(
    new T.Vector3(15, 0, -10),
    new T.Vector3(20, 0, -5),
    new T.Vector3(20, 0, 13),
    new T.Vector3(15, 0, 18)
);

let curve4 = new T.CubicBezierCurve3(
    new T.Vector3(15, 0, 18),
    new T.Vector3(10, 0, 23),
    new T.Vector3(-10, 0, 23),
    new T.Vector3(-15, 0, 18)
);

export class Curve extends GrObject
{
    constructor()
    {
        let trackgroup = new T.Group();
        let linegroup = new T.Group();

        points1 = curve1.getPoints(50);
        let geom = new T.BufferGeometry().setFromPoints(points1);
        let material = new T.LineBasicMaterial({color:"white", linewidth:1});
        let line = new T.Line(geom, material);
        linegroup.add(line);

        points2 = curve2.getPoints(50);
        geom = new T.BufferGeometry().setFromPoints(points2);
        line = new T.Line(geom, material);
        linegroup.add(line);

        points3 = curve3.getPoints(50);
        geom = new T.BufferGeometry().setFromPoints(points3);
        line = new T.Line(geom, material);
        linegroup.add(line);

        points4 = curve4.getPoints(50);
        geom = new T.BufferGeometry().setFromPoints(points4);
        line = new T.Line(geom, material);
        linegroup.add(line);
        trackgroup.add(linegroup);

        let railgroup = new T.Group();
        let trackgeom = new T.BoxGeometry(0.3, 0.3, 1.5);
        let trackmat = new T.MeshStandardMaterial({color:"black"});
        for(let i = 0; i < 40; i++)
        {
            let rail = new T.Mesh(trackgeom, trackmat);

            if(i < 10)
            {
                rail.translateX(points1[i*5].x);
                rail.translateZ(points1[i*5].z); 
            }
            else if(i < 20)
            {
                rail.translateX(points2[(i-10)*5].x);
                rail.translateZ(points2[(i-10)*5].z); 
            }
            else if(i < 30)
            {
                rail.translateX(points3[(i-20)*5].x);
                rail.translateZ(points3[(i-20)*5].z); 
            }
            else
            {
                rail.translateX(points4[(i-30)*5].x);
                rail.translateZ(points4[(i-30)*5].z); 
            }
            rail.lookAt(0,0,0);
            
            railgroup.add(rail);
        }
        trackgroup.add(railgroup);

        super('curve', trackgroup);
    }
}

let objctr = 0;
export class Train1 extends GrObject
{
    constructor()
    {
        let train = new T.Group();

        let bodygeom = new T.BoxGeometry(1, 1, 3);
        let bodymat = new T.MeshStandardMaterial({color:"red", roughness:0.75, metalness:0.5});
        let body = new T.Mesh(bodygeom, bodymat);
        body.position.y = 0.8;
        train.add(body);

        let wheelgeom = new T.CylinderGeometry(0.3, 0.3, 0.1, 32);
        let wheelmat = new T.MeshStandardMaterial({color:"black", roughness:0.75, metalness:0.5});

        let wheelgroup = new T.Group();
        for(let i = 0; i < 3; i++)
        {
            let wheel = new T.Mesh(wheelgeom, wheelmat);
            wheel.position.y = 0.3;
            wheel.position.x = 0.5;
            wheel.position.z = -1 + i*1;
            wheel.rotateZ(90 *Math.PI/180);
            wheelgroup.add(wheel);
        }
        for(let i = 0; i < 3; i++)
        {
            let wheel = new T.Mesh(wheelgeom, wheelmat);
            wheel.position.y = 0.3;
            wheel.position.x = -0.5;
            wheel.position.z = -1 + i*1;
            wheel.rotateZ(90 *Math.PI/180);
            wheelgroup.add(wheel);
        }
        train.add(wheelgroup);

        let nosegeom = new T.CylinderGeometry(0.4, 0.2, 0.7);
        let nosemat = new T.MeshStandardMaterial({color:"black", roughness:0.75, metalness:0.5});
        let nose = new T.Mesh(nosegeom, nosemat);
        train.add(nose);
        nose.position.y = 1.7;
        nose.position.z = 1;

        super("train", train);
        this.rideable = nose;

        let step = 0;
        let whichcurve = 1;
        this.step = step;
        this.train = train;
        this.curve1 = curve1;
        this.tick = function(delta, timeOfDay) 
        {
            if(step == 50)
            {
                step = 0;
                whichcurve++;
                if(whichcurve == 5)
                {
                    whichcurve = 1;
                }
            }
        
            if(whichcurve == 1)
            {
                this.train.position.set(points1[step].x, points1[step].y, points1[step].z);
              //  this.train.lookAt(curve1.getTangent(step));
            }
            else if(whichcurve == 2)
            {
                this.train.position.set(points2[step].x, points2[step].y, points2[step].z);
              //  this.train.lookAt(curve2.getTangent(step));
            }
            else if(whichcurve == 3)
            {
                this.train.position.set(points3[step].x, points3[step].y, points3[step].z);
               // this.train.lookAt(curve3.getTangent(step));
            }
            else
            {
                this.train.position.set(points4[step].x, points4[step].y, points4[step].z);
               // this.train.lookAt(curve4.getTangent(step));
            }
            this.train.lookAt(0,0,0);
            this.train.rotateY(90*Math.PI/180);
            step++;
        };
    }
}