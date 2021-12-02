function Basic2() {

    // fractal refinement steps
    let steps = 1;

    let slider = document.getElementById("slider");
    slider.addEventListener("change", changeSteps);
    slider.value = 1;


    createScene();
    
    // interaction
    function changeSteps() {
        steps = this.value;
        createScene();
    }
    
    function createBox() {
        // TODO 7.2a)   Set up a shape node, a box node,
        //              an appearance node and a material
        //              node. Use the material node to 
        //              define the color of the box as white.
        //              Then, append the material node to the 
        //              appearance node, both appearance and 
        //              box node to the shape node. Return the
        //              shape node.
        //              You will have to make use of the functions
        //              createElement(), setAttribute() and 
        //              appendChild(). You can find examples for
        //              their usage in createScene().

        let shape = document.createElement("shape");
        return shape;
    }

    function refine(parents) {
        // refine each of the transformations ("parents") into 12 single transformations
        let children = new Array(parents.length * 12);
        let counter = 0;
        for (let p = 0; p < parents.length; p++) {
            // for each of the 27 smaller "boxes", ...
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    for (let k = -1; k <= 1; k++) {
                        // ... decide whether they should be considered or thrown away
                        let sum = Math.abs(i) + Math.abs(j) + Math.abs(k);
                        if (sum < 3 && sum > 1) {
                            // set up a new child transformation
                            children[counter] = constructChildTransformation(parents[p], 0.66 * i + " " + 0.66 * j + " " + 0.66 * k);
                            counter++;
                        }
                    }
                }
            }
        }

        return children;
    }

    function constructChildTransformation(parent, translation) {
        // TODO 7.2b):  Create a new transformation node
        //              for one child box (or for further
        //              refinement!). The child box
        //              has to be scaled to one third of
        //              its parent's size, and the translation
        //              has to be applied. Finally, the 
        //              new transformation should be appended
        //              to its parent transformation.
        //              Again, use createElement(), setAttribute()
        //              and appendChild().
        //              Replace the following dummy line
        //              to return the newly created transform
        //              instead of the parent transform.

        return parent;
    }

    function createScene() {
        // get the x3dom scene node, which will contain the fractal,
        // and remove all children already there, except for the viewpoints
        let scene = document.getElementById("fractal");
        while (scene.children.length > 2) {
            scene.removeChild(scene.lastChild);
        }

        // append a background node, which makes the whole background dark blue
        let background = document.createElement("background");
        background.setAttribute("groundColor", "0 0 0.3");
        background.setAttribute("skyColor", "0 0 0.3");
        scene.appendChild(background);

        // create the root transform, which enlarges its contents 
        let transf = document.createElement("transform");
        transf.setAttribute("scale", "2 2 2");
        scene.appendChild(transf);

        // create a list of transforms which are filled with boxes in the end
        // initially, this only contains the root transform
        let listOfTransforms = [transf];

        // for the number of iterations stored in "steps",
        // compute the new list of transforms from the old list
        // of transforms using the function refine()
        for (let i = 0; i < steps; i++) {
            listOfTransforms = refine(listOfTransforms);
        }

        // for every transform in the resulting list,
        // append a box to be drawn
        for (let i = 0; i < listOfTransforms.length; i++) {
            let box = createBox();
            listOfTransforms[i].appendChild(box);
        }
    }
}
