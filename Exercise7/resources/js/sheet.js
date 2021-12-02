"use strict";

let isChrome = !!window.chrome && !!window.chrome.webstore;
let isFirefox = typeof InstallTrigger !== 'undefined';

function getMeta(scope, name, defaultValue) {
  let warn = false
  if (scope === undefined) scope = document;
  if (defaultValue === undefined) warn = true;

  let elements = scope.querySelectorAll('meta[name=' + name + ']');
  if (elements === undefined || elements.length == 0 || elements[0].getAttribute === undefined || elements[0].getAttribute('content') === undefined) {
    if (warn) {
      alert("You need a <meta name=\"" + name + "\" content=\"...\"> element in your <head> section")
    } else {
      return defaultValue
    }
  } else {
    return elements[0].getAttribute('content')
  }
}

function formatSheet() {
  let scope = document;

  let exerciseNr = getMeta(scope, 'exerciseNr');
  let lecture = getMeta(scope, 'lecture');
  let exercisePrefix = getMeta(scope, 'exercisePrefix', 'Exercise');
  let term = getMeta(scope, 'term');
  let dueDate = getMeta(scope, 'dueDate', '');

  let title = exercisePrefix + " #" + exerciseNr;
  let titleElements = scope.querySelectorAll('title');
  if (titleElements !== undefined && titleElements.length > 0) {
    title = titleElements[0]
  } else {
    setupTitle(scope, title)
  }

  if (exercisePrefix && title && lecture && exerciseNr && term) {
    setupHeaders(scope, lecture, exercisePrefix, exerciseNr, term, dueDate)
    //setupFooters(scope, lecture, exercisePrefix, exerciseNr, term, dueDate)

    setupExercises(scope, exerciseNr)
    setupTasks(scope, exerciseNr)
    setSuperResolution(scope)

    //layout finished, show the pages
    let pages = document.querySelectorAll("page")
    for (let i in pages) {
      let page = pages[i]
      if (page.nodeType == Node.ELEMENT_NODE) {
        page.className += "transitionVisible"
      }
    }

    callScripts(scope)
    loadInner(scope)
  }
}

function setupTitle(scope, title) {
  if (scope === undefined) scope = document;
  let head = scope.querySelectorAll('head')[0];
  let node = document.createElement("title");
  node.innerHTML = title
  head.appendChild(node)
}

function setupHeaders(scope, lecture, prefix, number, term, dueDate) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('page');
  if (dueDate != '') dueDate = '<dueDate>Submission: <b>' + dueDate + '</b></dueDate>';
  for (let i in elements) {
    let page = elements[i];
    if (page && page.insertBefore) {
      let header = document.createElement("header");
      header.innerHTML = '<table style="width:100%"><tr><th><h1><lecture>' + lecture + '</lecture>' + prefix + ' ' + number + '</h1>' + dueDate + '</th><td><img src="./resources/lgdv.png" width=160 /></td></table>';

      page.insertBefore(header, page.firstChild)
    }
  }
}

function setupFooters(scope, lecture, prefix, number, term, dueDate) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('page');
  for (let i in elements) {
    let page = elements[i];
    if (page && page.appendChild) {
      let footer = document.createElement("footer");
      footer.innerHTML = '<table style="width:100%"><tr><th>' + lecture + '</th><td>' + term + '</td></table>'

      page.appendChild(footer);
    }
  }
}

function setupExercises(scope, number) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('exercise');
  for (let i in elements) {
    let exercise = elements[i];
    if (exercise.nodeType == Node.ELEMENT_NODE) {
      let prefix = "Exercise";
      if (exercise.getAttribute("prefix")) {
        prefix = exercise.getAttribute("prefix")
      }

      let title = "<span style='color:magenta'>[please add a title attribute]</span>";
      if (exercise.getAttribute("title")) {
        title = exercise.getAttribute("title")
      }

      let pointsExercise = "<span style='color:magenta'>[please add a points attribute]</span>"; if (exercise.getAttribute("points")) {
        pointsExercise = exercise.getAttribute("points")
      }

      let h1 = document.createElement("h1");
      h1.innerHTML = prefix + " " + number + " <strong>" + title + "</strong>" + " [" + pointsExercise + " points]";
      exercise.insertBefore(h1, exercise.firstChild)
    }
  }
}

function setupTasks(scope, number) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('task');
  let partNr = 1;


  for (let i in elements) {
    let task = elements[i];
    if (task.nodeType == Node.ELEMENT_NODE) {

      //make sure that a task that is the first child of an exercise does not have a top-margin
      let zeroTopMargin = false;
      if (task.parentElement && task.parentElement.childNodes) {
        let lastWasHeadline = false;
        for (let c in task.parentElement.childNodes) {
          let child = task.parentElement.childNodes[c]
          if (child.nodeType == Node.COMMENT_NODE || child.nodeType == Node.TEXT_NODE) continue;

          if (child.nodeType == Node.ELEMENT_NODE) {
            if (lastWasHeadline && child === task) {
              zeroTopMargin = true;
            }

            if (child.nodeName === "H1" || child.nodeName === "H2" || child.nodeName === "H3" || child.nodeName === "H4") {
              lastWasHeadline = true
            } else {
              lastWasHeadline = false
            }
          } else {
            lastWasHeadline = false
          }
        }
      }

      //add a default header
      let prefix = "Task";
      if (task.getAttribute("prefix")) {
        prefix = task.getAttribute("prefix")
      }

      let title = "<span style='color:magenta'>[please add a title attribute]</span>";
      if (task.getAttribute("title")) {
        title = task.getAttribute("title")
      }

      let pointsTask = "<span style='color:magenta'>[please add a points attribute]</span>";
      if (task.getAttribute("points")) {
        pointsTask = task.getAttribute("points")
      }

      let submitFile = "<span style='color:magenta'>[please add a submit file attribute]</span>";
      if (task.getAttribute("submitfile")) {
        submitFile = task.getAttribute("submitfile")
      }

      let h2 = document.createElement("h2");
      if (zeroTopMargin == true) {
        if (h2.style) {
          h2.style.marginTop = "0cm"
        }
      }
      h2.innerHTML = prefix + " " + number + "." + partNr + " <strong>" + title + "</strong>" + " [" + pointsTask + " points]" + " - Submission file: <i>" + submitFile + "</i>";
      task.insertBefore(h2, task.firstChild)

      setupSubTasks(task, number, partNr, pointsTask)
      partNr++;
    }
  }
}

function setupSubTasks(scope, number, taskNr, pointsTask) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('subtask');
  let partNr = 0;

  let sumPoints = 0

  for (let i in elements) {
    let subtask = elements[i];
    if (subtask.nodeType == Node.ELEMENT_NODE) {
      let title = document.createElement("h1");

      title = "<span style='color:magenta'>[please add a title attribute]</span>";
      if (subtask.getAttribute("title")) {
        title = subtask.getAttribute("title")
      }

      let pointsSubTask = "<span style='color:magenta'>[please add a points attribute]</span>"; if (subtask.getAttribute("points")) {
        pointsSubTask = subtask.getAttribute("points")
      }
      sumPoints += parseInt(pointsSubTask);

      let h3 = document.createElement("h3");
      h3.innerHTML = "<span class='enum'>" + String.fromCharCode(97 + partNr) + ")</span> <strong>" + title + "</strong>" + " [" + pointsSubTask + "/" + pointsTask + "]";
      subtask.insertBefore(h3, subtask.firstChild)

      partNr++;
    }
  }
  if (sumPoints > pointsTask)
    window.alert("Sum of subtask points exceeds task points");
}

function setSuperResolution(scope) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('[superResolution]');
  for (let i in elements) {
    let canvas = elements[i]
    if (canvas.nodeType == Node.ELEMENT_NODE) {
      let ctx = canvas.getContext('2d');

      if (ctx) {
        let scale = canvas.getAttribute("superResolution")
        //if (window.devicePixelRatio > 1) {
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;

        canvas.width = canvasWidth * scale;
        canvas.height = canvasHeight * scale;
        canvas.style.width = canvasWidth;
        canvas.style.height = canvasHeight;

        ctx.scale(scale, scale);
      }
    }
  }
}

Function.prototype.applyAsync = function (params, delay) {
  let function_context = this;
  setTimeout(function () {
    let val = function_context.apply(undefined, params);
  }, delay);
}

let didNagChromers = false
function loadResource(url, payload, didLoad, didFail) {
  url = url + '?t=' + Math.random()
  let xmlhttp = new XMLHttpRequest(),
    localTest = /^(?:file):/
  xmlhttp.payload = payload
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4) {
      status = xmlhttp.status;
    }
    if (localTest.test(location.href) && xmlhttp.responseText) {
      status = 200;
    }
    if (xmlhttp.readyState == 4 && status == 200) {
      let text = xmlhttp.responseText;
      didLoad.applyAsync([text, xmlhttp.payload]);
    } else if (xmlhttp.readyState == 4) {
      console.log("Failed to load", url, status, xmlhttp.readyState, "to", xmlhttp.payload)
      if (isChrome && !didNagChromers) {
        didNagChromers = true
        if (navigator.appVersion.indexOf("Win") != -1)
          alert("Please start Chrome using Chrome.exe --allow-file-access-from-files " + window.location)
        if (navigator.appVersion.indexOf("Mac") != -1)
          alert("Please start Chrome using /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --allow-file-access-from-files " + window.location)
        else
          alert("Please start Chrome using chrome --allow-file-access-from-files " + window.location)
      }
      try {
        didFail(status, xmlhttp.readyState, xmlhttp.payload)
      } catch (err) {

      }
    }
  }

  try {
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  } catch (err) {
    try {
      didFail(-1)
    } catch (err) {

    }
    if (isChrome && !didNagChromers) {
      didNagChromers = true
      if (navigator.appVersion.indexOf("Win") != -1)
        alert("Please start Chrome using Chrome.exe --allow-file-access-from-files " + window.location)
      if (navigator.appVersion.indexOf("Mac") != -1)
        alert("Please start Chrome using /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --allow-file-access-from-files " + window.location)
      else
        alert("Please start Chrome using chrome --allow-file-access-from-files " + window.location)
    }
  }
}

function loadInner(scope) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('[data-inner]');

  let svgid = 1
  for (let i in elements) {
    let node = elements[i]

    if (node.getAttribute) {
      let url = node.getAttribute("data-inner")
      url = url + '?t=' + Math.random()

      loadResource(url, node, function (text, payload) {
        //console.log("Did Load", text, node, payload)
        payload.innerHTML = text
      })

      /*node.setAttribute("data-inner-id", "node"+svgid)
      let container = document.createElement("object");
      container.setAttribute('id', 'svg'+svgid)
      container.setAttribute('data-inner-link', "node"+svgid)
      container.setAttribute('type', 'text/html')
      container.setAttribute('data', url)
      container.style['position'] = 'absolute'
      container.style['left'] = '-9999px'
      container.style['right'] = '-9999px'
      //container.style['visibility'] = 'hidden';
      container.addEventListener("load", function(e){
        let svg = scope.querySelector('[data-inner-id='+e.target.getAttribute('data-inner-link')+']');
        console.log(e.target, e, e.target.contentDocument.querySelector('body').firstChild.innerHTML)
        if (e.target.contentDocument.querySelector('body').firstChild.nodeName === "SVG") {
          svg.innerHTML = e.target.contentDocument.querySelector('body').firstChild.innerHTML
        } else {
          svg.innerHTML = e.target.contentDocument.querySelector('body').innerHTML
        }
        //e.target.parentNode.removeChild(e.target)
      });
      node.parentNode.insertBefore(container, node)
      svgid++
      console.log("added", container)*/
    }
  }
}

function stopTheWait(id) {
  let img = document.querySelector("[data-call-id=img" + id + "]")
  if (img) {
    img.className += "transitionHidden"
  }
}

let GLOBAL_SHADERS = [];
function didLoadShader(id, scriptNodeId) {
  GLOBAL_SHADERS.push(id);
  //console.log("Shaders", GLOBAL_SHADERS, id, scriptNodeId);
  if (scriptNodeId) {
    let shader = document.querySelector("#" + id);
    //console.log(shader)

    let script = document.createElement("script");
    script.setAttribute("type", shader.getAttribute("type"))
    script.setAttribute("id", shader.getAttribute("id"));
    script.innerHTML = shader.innerHTML;
    shader.parentNode.replaceChild(script, shader);

    didLoadCall(document.querySelector("#" + scriptNodeId));
  }
}

function didLoadCall(script) {
  //console.log("script", script)
  let all = true;
  if (script && script.getAttribute('data-call-depends')) {
    let depends = JSON.parse(script.getAttribute('data-call-depends'))
    let onload = script.getAttribute('data-call-onload')
    let d = depends.length;

    while (d--) {
      let name = depends[d];
      let g = GLOBAL_SHADERS.length;
      let one = false;
      while (g--) {
        let gname = GLOBAL_SHADERS[g]
        if (gname == name) {
          one = true;
          break;
        }
      }

      if (!one) {
        all = false;
        break;
      }
    }
  }

  //console.log(script, depends, onload);
  if (all) {
    //console.log("init call for ", script);
    eval(onload);
  } else {
    //console.log("deferred init call for ", script)
  }
}
function callScripts(scope) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('[data-call]');
  let files = {}
  let callId = 1;
  let container = undefined;

  //collect call information from dom enteties
  for (let i in elements) {
    let node = elements[i]


    if (node.getAttribute) {
      let img = undefined
      if (!isFirefox) {
        container = document.createElement("div");
        let parent = document.createElement("overlayContainer");
        let img = document.createElement("img");
        img.setAttribute("data-call-id", "img" + callId)
        let computedStyle = window.getComputedStyle(node, null);
        let completeStyle = computedStyle.cssText;
        if (isChrome) {
          completeStyle = completeStyle.replace(/,/g, ".")
        }
        container.style.cssText = completeStyle;
        container.style['padding'] = "0"
        container.style['border'] = "0px solid white"
        container.style['margin'] = "59,4px"
        node.style['margin'] = "0px"

        container.appendChild(parent)

        node.parentNode.replaceChild(container, node);
        parent.appendChild(node)
        parent.appendChild(img)
      }

      node.setAttribute("data-call-id", "call" + callId)

      let methodName = node.getAttribute("data-call")
      let src = node.getAttribute("data-call-src")

      let list = files[src]
      if (!list) {
        list = Array()
        files[src] = list
      }

      //we can define shader code that needs to get loaded BEFORE the actual script
      let shaders = node.querySelectorAll('shader');
      let dependencies = [];
      for (let i in shaders) {
        let shader = shaders[i]

        if (shader.getAttribute) {
          let type = shader.getAttribute('type');
          if (type === 'vertex') type = '--vertex';
          else if (type === 'fragment') type = '--fragment';

          let script = document.createElement("script");
          script.setAttribute("id", shader.getAttribute("id"));
          script.setAttribute("type", type)

          if (shader.getAttribute("src")) {
            script.setAttribute("data-inner", shader.getAttribute("src"))
            script.setAttribute("async", "")
            dependencies.push(shader.getAttribute("id"));
            script.setAttribute("data-inner-onload", "didLoadShader('" + shader.getAttribute("id") + "', '" + node.getAttribute("data-call-id") + "');")
          } else {
            script.innerHTML = shader.innerHTML;
          }

          node.removeChild(shader);
          node.parentNode.insertBefore(script, node);
        }
      }

      list.push({ name: methodName, element: node, id: callId, waitImage: img })
      callId++
    }
  }

  executeCalls.applyAsync([files, container], 200)
}

function showErrorHint(canvas){
  if(!canvas || !canvas.getContext) return;
  let context = canvas.getContext('2d');
  if(!context) return;
  context.font = "18px Arial";
  context.textAlign = "center";
  context.fillStyle ="red"
  context.fillText("⚠ error ⚠", 0.5*canvas.width, 0.5*canvas.height);
  context.fillText("check console", 0.5*canvas.width, 0.5*canvas.height+18);
}

function executeCalls(files, container) {
  if (container === undefined) {
    container = document.querySelector('body')
  }
  //async load each referenced file once, evaluate and call all methods in sequence
  for (let file in files) {
    let data = files[file]
    let calls = ""
    for (let i in data) {
      let info = data[i]
      let call = "try{"
        + info.name + "(document.querySelector('[data-call-id=call" + info.id + "]'));"
      +"}catch(e){"
        +"showErrorHint(document.querySelector('[data-call-id=call" + info.id + "]'));"
        +"throw e;"
      +"}" 
      +"stopTheWait('" + info.id + "');"
      calls += call;
    }
    //console.log(file, calls)
    let script = document.createElement("script");
    script.setAttribute("type", "text/javascript")
    script.setAttribute("src", file + "?t=9")
    script.setAttribute("async", "")
    script.setAttribute("onload", calls)
    container.appendChild(script)
  }
}

window.onload = function (e) {
  formatSheet()
  try {
    onLoad()
  } catch (err) {

  }
}
