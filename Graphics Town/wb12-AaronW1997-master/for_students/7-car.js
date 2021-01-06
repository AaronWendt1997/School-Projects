/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-THREE/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import { CylinderGeometry, FontLoader } from "../libs/CS559-THREE/build/three.module.js";

// define your vehicles here - remember, they need to be imported
// into the "main" program

export class Road extends GrObject
{
    constructor()
    {
        let road = new T.Group();
        let asphgeom = new T.BoxGeometry(30, 0.01, 5);
        let asphmat = new T.MeshStandardMaterial({color:0x544D44, metalness:0.5, roughness:1});
        let asphalt = new T.Mesh(asphgeom, asphmat);
        road.add(asphalt);

        let streakgeom = new T.BoxGeometry(2, 0.01, 0.7);
        let streakmat = new T.MeshStandardMaterial({color:"yellow", metalness:0.5, roughness:1});

        for(let i = 0; i < 15; i++)
        {
            if(i % 2 == 0)
            {
                let streak = new T.Mesh(streakgeom, streakmat);
                streak.position.y += 0.01;
                streak.position.x = -14 + i*2;
                road.add(streak);
            }
        }
        
        super("road", road);
    }
}

export class Truck extends GrObject {
    constructor() {
        let all = new T.Group();
        let exsettings = {steps:2, depth:1.5, bevelEnabled:false};
        let exsettings2 = {steps:2, depth:1.51, bevelEnabled:false};
        let exsettings3 = {steps:2, depth:1.3, bevelEnabled:false};

        let bodycurve = new T.Shape();
        bodycurve.moveTo(0, 0);
        bodycurve.lineTo(0, 0.75);
        bodycurve.lineTo(1, 0.75);
        bodycurve.lineTo(1.5, 1.5);
        bodycurve.lineTo(2.5, 1.5);
        bodycurve.lineTo(2.5, 0.75);
        bodycurve.lineTo(4, 0.75);
        bodycurve.lineTo(4, 0);
        bodycurve.lineTo(0, 0);

        let t1 = new T.TextureLoader().load("../images/car_paint.PNG");
        let test = new T.MeshStandardMaterial({color:"white", map:t1, metalness:0.75, roughness:1});

        let bodygeom = new T.ExtrudeGeometry(bodycurve, exsettings);
        let body = new T.Mesh(bodygeom, test);
        all.add(body);
        body.position.y = 0.4;

        let wheelgeom = new T.CylinderGeometry(0.4, 0.4, 0.1, 32);
        let wheelmat = new T.MeshStandardMaterial({color:"black", roughness:1});

        let wheel;
        let wheels = [];
        for(let i = 0; i < 4; i++)
        {
            wheel = new T.Mesh(wheelgeom, wheelmat);
            wheel.rotateX(90*Math.PI/180);
            body.add(wheel);
            wheels.push(wheel);
        }

        wheels[0].translateX(0.75);
        wheels[1].translateX(3.25);
        wheels[2].translateX(0.75); wheels[2].translateY(1.5);
        wheels[3].translateX(3.25); wheels[3].translateY(1.5);

        let windowcurve = new T.Shape();
        windowcurve.moveTo(1.75, 0.75);
        windowcurve.lineTo(1.75, 1.4);
        windowcurve.lineTo(1.5, 1.4);
        windowcurve.lineTo(1.1, 0.75);
        windowcurve.lineTo(1.75, 0.75);

        let t2 = new T.TextureLoader().load("../images/car_window.png");
        let windowmat = new T.MeshStandardMaterial({map:t2});
        let sidewindowgeom = new T.ExtrudeGeometry(windowcurve, exsettings2);
        let sidewindow = new T.Mesh(sidewindowgeom, windowmat);
        body.add(sidewindow);
        sidewindow.position.z -= 0.005;

        let windshieldcurve = new T.Shape();
        windshieldcurve.moveTo(1.05, 0.825);
        windshieldcurve.lineTo(1.45, 1.425);
        windshieldcurve.lineTo(1.5, 1.475);
        windshieldcurve.lineTo(1.1, 0.775);

        let windshieldgeom = new T.ExtrudeGeometry(windshieldcurve, exsettings3);
        let windshield = new T.Mesh(windshieldgeom, windowmat);
        body.add(windshield);
        windshield.position.x -= 0.001;
        windshield.position.z += 0.1;

        let randgeom = new T.BoxGeometry(0.1, 0.1, 0.1);
        let rand = new T.Mesh(randgeom, windowmat);
        rand.position.y = 0.4;
        rand.position.z += 0.75;
        rand.lookAt(-20, 0, 0);
        body.add(rand);
        
        all.position.x += 10;
        super("Truck", all);
        this.rideable = rand;
        //this.rideable.lookAt(-20, 2, -2);

        let t = 0;
        this.t = t;
        this.all = all;
        this.state = 0;
        let forward = true;
        this.forward = forward;
        this.tick = function(delta, timeOfDay)
        {
            let moverate = delta*0.01;

            if(forward == true)
            {
                this.all.position.x += moverate;
            }
            else
            {
                this.all.position.x -= moverate;
            }

            if(this.all.position.x > 12)
            {
                forward = false;
            }
            else if(this.all.position.x < -15)
            {
                forward = true;
            }

        };
    }
}
