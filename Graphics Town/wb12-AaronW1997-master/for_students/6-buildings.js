/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-THREE/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";

// define your buildings here - remember, they need to be imported
// into the "main" program
export class Tree extends GrObject {
    constructor() {
        let tree = new T.Group();
        
        let basegeom = new T.BoxGeometry(0.1, 0.5, 0.1);
        let basemat = new T.MeshStandardMaterial({color:"brown", roughness:0.75});
        let base = new T.Mesh(basegeom, basemat);

        let topgeom = new T.ConeGeometry(0.2, 0.7, 32);
        let treemat = new T.MeshStandardMaterial({color:"green", roughness:0.75});
        let top = new T.Mesh(topgeom, treemat);

        tree.add(base);
        tree.add(top);
        top.position.y = 0.5;
        base.position.y = 0.25;

        super("Tree", tree);
    }
}

export class SkyScraper extends GrObject {

    constructor() {

        let all = new T.Group();
        let geometry = new T.Geometry();
        let roof = new T.Geometry();

        function addSide()
        {
            geometry.faceVertexUvs[0].push([
                new T.Vector2(0, 0),
                new T.Vector2(1, 0),
                new T.Vector2(1, 1)
            ]);
            geometry.faceVertexUvs[0].push([
                new T.Vector2(0, 0),
                new T.Vector2(1, 1),
                new T.Vector2(0, 1)
            ]);
        }

        //base
        geometry.vertices.push(new T.Vector3(0, 0, 0)); //0
        geometry.vertices.push(new T.Vector3(1, 0, 0)); //1
        geometry.vertices.push(new T.Vector3(0, 0, 1)); //2
        geometry.vertices.push(new T.Vector3(1, 0, 1)); //3

        //mid
        geometry.vertices.push(new T.Vector3(0, 2, 0)); //4
        geometry.vertices.push(new T.Vector3(1, 2, 0)); //5
        geometry.vertices.push(new T.Vector3(0, 2, 1)); //6
        geometry.vertices.push(new T.Vector3(1, 2, 1)); //7

        //top
        geometry.vertices.push(new T.Vector3(0, 4, 0)); //8
        geometry.vertices.push(new T.Vector3(1, 4, 0)); //9
        geometry.vertices.push(new T.Vector3(0, 4, 1)); //10
        geometry.vertices.push(new T.Vector3(1, 4, 1)); //11

        //roof tip
        geometry.vertices.push(new T.Vector3(0.5, 4.75, 0.5)); //12

        //front face - lower half
        let f1 = new T.Face3(2, 3, 7);
        geometry.faces.push(f1);
        let f2 = new T.Face3(2, 7, 6);
        geometry.faces.push(f2);
        addSide();

        //front face - top half
        let f1l2 = new T.Face3(6, 7, 11);
        geometry.faces.push(f1l2);
        let f2l2 = new T.Face3(6, 11, 10);
        geometry.faces.push(f2l2);
        addSide();

        //left side - lower half
        let f3 = new T.Face3(3, 1, 5);
        geometry.faces.push(f3);
        let f4 = new T.Face3(3, 5, 7);
        geometry.faces.push(f4);
        addSide();

        //left side - top half
        let f3l2 = new T.Face3(7, 5, 9);
        geometry.faces.push(f3l2);
        let f4l2 = new T.Face3(7, 9, 11);
        geometry.faces.push(f4l2);
        addSide();

        //back side - lower half
        let f5 = new T.Face3(1, 0, 4);
        geometry.faces.push(f5);
        let f6 = new T.Face3(1, 4, 5);
        geometry.faces.push(f6);
        addSide();

        //back side - top half
        let f5l2 = new T.Face3(5, 4, 8);
        geometry.faces.push(f5l2);
        let f6l2 = new T.Face3(5, 8, 9);
        geometry.faces.push(f6l2);
        addSide();

        //left side - lower half
        let f7 = new T.Face3(0, 2, 6);
        geometry.faces.push(f7);
        let f8 = new T.Face3(0, 6, 4);
        geometry.faces.push(f8);
        addSide();

        //left side - top half
        let f7l2 = new T.Face3(4, 6, 10);
        geometry.faces.push(f7l2);
        let f8l2 = new T.Face3(4, 10, 8);
        geometry.faces.push(f8l2);
        addSide();

        //roof
        roof.vertices.push(new T.Vector3(0, 4, 0)); //0
        roof.vertices.push(new T.Vector3(1, 4, 0)); //1
        roof.vertices.push(new T.Vector3(0, 4, 1)); //2
        roof.vertices.push(new T.Vector3(1, 4, 1)); //3
        roof.vertices.push(new T.Vector3(0.5, 4.75, 0.5)); //4

        
        let f9 = new T.Face3(2, 3, 4);
        roof.faces.push(f9);
        let f10 = new T.Face3(3, 1 ,4);
        roof.faces.push(f10);
        let f11 = new T.Face3(1, 0, 4);
        roof.faces.push(f11);
        let f12 = new T.Face3(0, 2, 4);
        roof.faces.push(f12);

        geometry.computeFaceNormals();
        geometry.uvsNeedUpdate = true;
        roof.computeFaceNormals();
        roof.uvsNeedUpdate = true;

        let t1 = new T.TextureLoader().load("../images/glass_window.png");
        let skymat = new T.MeshStandardMaterial({ map:t1, roughness:0.75});
        let mesh1 = new T.Mesh(geometry, skymat);

        let roofmat = new T.MeshStandardMaterial({color:"gray"});
        let mesh2 = new T.Mesh(roof, roofmat);

        all.add(mesh1);
        all.add(mesh2);

        super("SkyScraper1", all);
    }
}

export class House1 extends GrObject {
    constructor() {

        let geometry = new T.Geometry();

        //base
        geometry.vertices.push(new T.Vector3(0, 0, 0)); //0
        geometry.vertices.push(new T.Vector3(1, 0, 0)); //1
        geometry.vertices.push(new T.Vector3(0, 0, 1)); //2
        geometry.vertices.push(new T.Vector3(1, 0, 1)); //3

        //top
        geometry.vertices.push(new T.Vector3(0, 1, 0)); //4
        geometry.vertices.push(new T.Vector3(1, 1, 0)); //5
        geometry.vertices.push(new T.Vector3(0, 1, 1)); //6
        geometry.vertices.push(new T.Vector3(1, 1, 1)); //7

        //roof tips
        geometry.vertices.push(new T.Vector3(0, 1.5, 0.5)); //8
        geometry.vertices.push(new T.Vector3(1, 1.5, 0.5)); //9

        //middle level
        geometry.vertices.push(new T.Vector3(0, 0.5, 0)); //10
        geometry.vertices.push(new T.Vector3(1, 0.5, 0)); //11
        geometry.vertices.push(new T.Vector3(0, 0.5, 1)); //12
        geometry.vertices.push(new T.Vector3(1, 0.5, 1)); //13

        geometry.faceVertexUvs = [[]];

        //bottom face
        let f1 = new T.Face3(0, 1, 2);
        geometry.faces.push(f1);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0, 0),
            new T.Vector2(0.01, 0),
            new T.Vector2(0, 0.01)
        ]);
        let f2 = new T.Face3(0, 3, 2);
        geometry.faces.push(f2); 
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0, 0),
            new T.Vector2(0.01, 0),
            new T.Vector2(0, 0.01)
        ]);

        //front face - level 1
        let f3 = new T.Face3(2, 3, 13);
        geometry.faces.push(f3);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(1/5, 0),
            new T.Vector2(4/5, 0),
            new T.Vector2(4/5, 1)
        ]);
        let f4 = new T.Face3(2, 13, 12);
        geometry.faces.push(f4);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(1/5, 0),
            new T.Vector2(4/5, 1),
            new T.Vector2(1/5, 1)
        ]);

        //front face - level 2
        let f3l2 = new T.Face3(12, 13, 7);
        geometry.faces.push(f3l2);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 0.2),
            new T.Vector2(2/5, 1)
        ]);
        let f4l2 = new T.Face3(12, 7, 6);
        geometry.faces.push(f4l2);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 1),
            new T.Vector2(0.0625, 1)
        ]);

        //right side - level 1
        let f5 = new T.Face3(3, 1, 11);
        geometry.faces.push(f5);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 0.2),
            new T.Vector2(2/5, 1)
        ]);
        let f6 = new T.Face3(3, 11, 13);
        geometry.faces.push(f6);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 1),
            new T.Vector2(0.0625, 1)
        ]);

        //right side - level 2
        let f5l2 = new T.Face3(13, 11, 5);
        geometry.faces.push(f5l2);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 0.2),
            new T.Vector2(2/5, 1)
        ]);
        let f6l2 = new T.Face3(13, 5, 7);
        geometry.faces.push(f6l2);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 1),
            new T.Vector2(0.0625, 1)
        ]);

        //left side - level 1
        let f7 = new T.Face3(0, 2, 12);
        geometry.faces.push(f7);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 0.2),
            new T.Vector2(2/5, 1)
        ]);
        let f8 = new T.Face3(0, 12, 10);
        geometry.faces.push(f8);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 1),
            new T.Vector2(0.0625, 1)
        ]);

        //left side - level 2
        let f7l2 = new T.Face3(10, 12, 6);
        geometry.faces.push(f7l2);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 0.2),
            new T.Vector2(2/5, 1)
        ]);
        let f8l2 = new T.Face3(10, 6, 4);
        geometry.faces.push(f8l2);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 1),
            new T.Vector2(0.0625, 1)
        ]);

        //back side - level 1
        let f9 = new T.Face3(1, 0, 10);
        geometry.faces.push(f9);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 0.2),
            new T.Vector2(2/5, 1)
        ]);
        let f10 = new T.Face3(1, 10, 11);
        geometry.faces.push(f10);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 1),
            new T.Vector2(0.0625, 1)
        ]);

        //back side - level 2
        let f9l2 = new T.Face3(11, 10, 4);
        geometry.faces.push(f9l2);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 0.2),
            new T.Vector2(2/5, 1)
        ]);
        let f10l2 = new T.Face3(11, 4, 5);
        geometry.faces.push(f10l2);
        geometry.faceVertexUvs[0].push([
            new T.Vector2(0.0625, 0.2),
            new T.Vector2(2/5, 1),
            new T.Vector2(0.0625, 1)
        ]);

        //roof front
        let f11 = new T.Face3(6, 7, 9);
        geometry.faces.push(f11);
        let f12 = new T.Face3(6, 9, 8);
        geometry.faces.push(f12);

        //roof back
        let f13 = new T.Face3(4, 8, 9);
        geometry.faces.push(f13);
        let f14 = new T.Face3(4, 9, 5);
        geometry.faces.push(f14);

        //roof left
        let f15 = new T.Face3(6, 8, 4);
        geometry.faces.push(f15);

        //roof right
        let f16 = new T.Face3(5, 9, 7);
        geometry.faces.push(f16);

        geometry.computeFaceNormals();
        geometry.uvsNeedUpdate = true;

        let t1 = new T.TextureLoader().load("../images/house.png");
        let housemat = new T.MeshStandardMaterial({ map:t1, roughness:0.75});
        let mesh = new T.Mesh(geometry, housemat);


        super("House1", mesh);
    }
}