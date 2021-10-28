"use strict";

///////////////////////////
//// global variables  ////
///////////////////////////

let polygon = new Polygon([new Point(100, 10),
                            new Point(120, 72),
                            new Point(186, 72),
                            new Point(136, 112),
                            new Point(153, 173),
                            new Point(100, 138),
                            new Point(47, 173),
                            new Point(64, 112),
                            new Point(14, 72),
                            new Point(80, 72)],
                        new Color(255, 127, 0));

/////////////////////
//// edge table  ////
/////////////////////

// edge table entry
function EdgeTableEntry(edge) {
    let dx = 0;
    let dy = 0;
    if (edge.startPoint.y < edge.endPoint.y) {
        this.y_lower = edge.startPoint.y;
        this.x_lower = edge.startPoint.x;
        this.y_upper = edge.endPoint.y;
        dx = edge.endPoint.x - edge.startPoint.x;
        dy = edge.endPoint.y - edge.startPoint.y;
    }
    else {
        this.y_lower = edge.endPoint.y;
        this.x_lower = edge.endPoint.x;
        this.y_upper = edge.startPoint.y;
        dx = edge.startPoint.x - edge.endPoint.x;
        dy = edge.startPoint.y - edge.endPoint.y;
    }

    this.invSlope = dx / dy;
}

function compareEdgeTableEntries(a, b) {
    return a.y_lower - b.y_lower;
}

function printEdgeTableEntry(e) {
    console.log("ET: " + e.y_lower + " " + e.x_lower + " " + e.y_upper + " " + e.invSlope);
}

// edge table
function EdgeTable(polygon) {
    this.entries = new Array(polygon.nEdges);
    this.nEntries = polygon.nEdges;

    for (let i = 0; i < polygon.nEdges; i++) {
        this.entries[i] = new EdgeTableEntry(polygon.edges[i]);
    }
    this.entries.sort(compareEdgeTableEntries);

    for (let i = 0; i < polygon.nEdges; i++) {
        printEdgeTableEntry(this.entries[i]);
    }
}

function deleteSetFromEdgeTable(et, set) {
    et.entries = et.entries.filter(entry => !set.includes(entry))
}

////////////////////////////
//// active edge table  ////
////////////////////////////

// active edge table entry
function ActiveEdgeTableEntry(edgeTableEntry) {
    this.x_intersect = edgeTableEntry.x_lower;
    this.y_upper = edgeTableEntry.y_upper;
    this.invSlope = edgeTableEntry.invSlope;
}

function compareActiveEdgeTableEntries(a, b) {
    return a.x_intersect - b.x_intersect;
}

// active edge table
function ActiveEdgeTable() {
    this.entries = new Array();
    this.nEntries = 0;
}

function addToActiveEdgeTable(aet, edge) {
    aet.entries.push(edge)
    aet.nEntries++
}


/////////////////////////////
//// scanline algorithm  ////
/////////////////////////////

function scanline(image, polygon) {

    let edgeTable = new EdgeTable(polygon);
    let activeEdgeTable = new ActiveEdgeTable();
    
    // TODO 2.3     Perform the scanline algorithm 
    //              by following the single comments.
    //              In order to reach the full number of
    //              points, you only have to do the man-
    //              datory part.

    for (let y_scanline = 0; y_scanline < image.height; y_scanline++) {
        // [optimization]
        // if the active edge table is empty (nEntries==0) we can step to the next edge, i.e. we can set y_scanline = myEdgeTableEntry.y_lower
        // note that the edge table is sorted by y_lower!
        if (activeEdgeTable.nEntries === 0 && edgeTable.entries[0]) {
            y_scanline = edgeTable.entries[0].y_lower
        }


        // [mandatory]
        // as we cannot delete entries from the active edge table:
        // - build a new active edge table
        // - copy all those edges from the previous active edge table which should still be in the active edge table for this scanline
        // - assign the new active edge table to activeEdgeTable
        let newActiveEdgeTable = new ActiveEdgeTable();
        activeEdgeTable.entries.forEach(entry => {
            if (y_scanline < entry.y_upper) {
                addToActiveEdgeTable(newActiveEdgeTable, entry)
            }
        })
        activeEdgeTable = newActiveEdgeTable


        // [mandatory]
        // add new edges from the edge table to the active edge table
        let entriesToDelete = new Array()
        edgeTable.entries.forEach(entry => {
            if (y_scanline === entry.y_lower) {
                addToActiveEdgeTable(activeEdgeTable, new ActiveEdgeTableEntry(entry))
                entriesToDelete.push(entry)
            }
        })
        deleteSetFromEdgeTable(edgeTable, entriesToDelete)


        // [mandatory]
        // sort the active edge table along x (use the array sort function with compareActiveEdgeTableEntries as compare function)
        activeEdgeTable.entries.sort(compareActiveEdgeTableEntries)


        // [mandatory]
        // rasterize the line:
        // for every two successive active edge entries set the pixels in between the x intersections (the first and the second entry build a line segment, the third and the fourth build a line segment and so on)
        // note that setPixel() requires integer pixel coordinates!
        for (let i = 0; i < activeEdgeTable.entries.length - 1; i = i + 2) {
            for (let x = Math.floor(activeEdgeTable.entries[i].x_intersect); 
                x < Math.floor(activeEdgeTable.entries[i + 1].x_intersect);
                x++)
            {
                setPixel(image, new Point(x, y_scanline), polygon.color)
            }
        }


        // [mandatory]
        // update the x_intersect of the active edge table entries
        activeEdgeTable.entries.forEach(entry => {
            entry.x_intersect += entry.invSlope
        })
    }
}


//////////////////////////
//// render function  ////
//////////////////////////

function RenderCanvas3() {
    // get canvas handle
    let context = document.getElementById("canvas3").getContext("2d");
    let canvas = context.createImageData(200, 200);

    // clear canvas
    clearImage(canvas, new Color(255, 255, 255));

    // draw line
    scanline(canvas, polygon);

    // show image
    context.putImageData(canvas, 0, 0);
}

function setupScanline(canvas) {
    // execute rendering
    RenderCanvas3();
}
