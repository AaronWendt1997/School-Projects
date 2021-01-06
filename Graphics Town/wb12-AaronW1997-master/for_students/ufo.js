/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-THREE/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";

export class UFO extends GrObject
{
    constructor()
    {
        let ufogroup = new T.Group();

        let cylgeom = new T.CylinderGeometry(1, 1, 0.1, 32);
        let ufoMat = new T.MeshStandardMaterial({color:"gray"});
        let ufoBase = new T.Mesh(cylgeom, ufoMat);
        ufogroup.add(ufoBase);
        ufoBase.position.y = 1;
        
        let topgeom = new T.SphereGeometry(0.6, 32, 32, 0, Math.PI*2, 0, Math.PI/2);
        let ufoTop = new T.Mesh(topgeom, ufoMat);
        ufogroup.add(ufoTop);
        ufoBase.add(ufoTop);
      
        let spinGeom = new T.BoxGeometry(0.1, 0.1, 0.75);
        let spinMat = new T.MeshStandardMaterial({color:"purple"});
        let ufospinner1 = new T.Mesh(spinGeom, spinMat);
      
        let spinGeom2 = new T.BoxGeometry(0.75, 0.1, 0.1);
        let ufospinner2 = new T.Mesh(spinGeom2, spinMat);
      
        let spingroup = new T.Group();
        spingroup.add(ufospinner1);
        spingroup.add(ufospinner2);
        ufoBase.add(ufospinner1);
        ufospinner1.add(ufospinner2);
      
        ufospinner1.position.y = 0.6;
        
        ufogroup.position.y = 10;
        super("ufo", ufogroup);

        this.ufogroup = ufogroup;
        this.ufospinner1 = ufospinner1;
        this.rideable = ufoTop;
        let t = 0;
        this.t = t;
        this.tick = function(delta, timeOfDay)
        {
            
            t += (delta*0.0025);
            let x = 5 + 5*Math.cos(t);
            let z = 5 + 5*Math.sin(t);
            ufogroup.position.x = x;
            ufogroup.position.z = z;
            ufospinner1.rotation.y = -performance.now()/200;

            ufoBase.lookAt(5, 10, 5);
            
        };
    }
}