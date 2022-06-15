MD.Import = function(){
  const workarea = document.getElementById("workarea");
  const $importInput = $('#tool_import input');
  const $openInput = $('#tool_open input');
  let fileKey = null;
  let clickDom = null;
  $importInput.on("change", importImage);
  $openInput.on("change", openImage);

  function importImage(e){
    const canvasContent = localStorage.getItem("md-canvasContent");
    $('#menu_bar').removeClass('active')
    if (!window.FileReader) return;
    //e.stopPropagation();
    //e.preventDefault();
    workarea.removeAttribute("style");
    $('#main_menu').hide();
    var file = null;
    if (e.type === "drop") file = e.dataTransfer.files[0]
    else file = this.files[0];
    if (!file) return $.alert("File not found");
    if (file.type.indexOf("image") === -1) return $.alert("File is not image"); 
    if(file.size>1070074.5) {
      $.alert("图片大小不能超过1MB！");
      return 
    } 
    //svg handing
    if(file.type.indexOf("svg") != -1) {
      var reader = new FileReader();
      reader.onloadend = function(e) {
        svgCanvas.importSvgString(e.target.result, true);
        //svgCanvas.ungroupSelectedElement();
        svgCanvas.alignSelectedElements("m", "page");
        svgCanvas.alignSelectedElements("c", "page");
      };
      reader.readAsText(file);
    }

    //image handling
    else {
      if(canvasContent) {
        $.dialog("<h4>当前已有内容信息</h4><p>如果上传将清空原有面板内容是否继续</p>",callback);
        fileKey = file;
        clickDom = e;
        return
      }
      var reader = new FileReader();
      reader.onloadend = function(e) {
        // lets insert the new image until we know its dimensions
        insertNewImage = function(img_width, img_height){
            var newImage = svgCanvas.addSvgElementFromJson({
            "element": "image",
            "attr": {
              "x": 0,
              "y": 0,
              "width": img_width,
              "height": img_height,
              "id": svgCanvas.getNextId(),
              "style": "pointer-events:inherit"
            }
          });
          svgCanvas.setHref(newImage, e.target.result);
          svgCanvas.selectOnly([newImage])
          svgCanvas.alignSelectedElements("m", "page")
          svgCanvas.alignSelectedElements("c", "page")
          editor.panel.updateContextPanel();
        }
        // put a placeholder img so we know the default dimensions
        var img_width = 100;
        var img_height = 100;
        var img = new Image()
        img.src = e.target.result
        document.body.appendChild(img);
        img.onload = function() {
          img_width = img.offsetWidth
          img_height = img.offsetHeight
          insertNewImage(img_width, img_height);
          document.body.removeChild(img);
        }
      };
      reader.readAsDataURL(file)
    }
    
    //editor.saveCanvas();
  }
  function callback(params) {
    var dims = state.get("canvasSize");
    if(params){
      state.set("canvasMode", "select")
      svgCanvas.clear();
      svgCanvas.setResolution(dims[0], dims[1]);
      editor.canvas.update(true);
      editor.zoom.reset();
      editor.panel.updateContextPanel();
      editor.paintBox.fill.prep();
      editor.paintBox.stroke.prep();
      svgCanvas.runExtensions('onNewDocument');
      sessionStorage.setItem("IsImport",  true);
      setTimeout(() => {
        var reader = new FileReader();
        reader.onloadend = function(clickDom) {
          // lets insert the new image until we know its dimensions
          insertNewImage = function(img_width, img_height){
              var newImage = svgCanvas.addSvgElementFromJson({
              "element": "image",
              "attr": {
                "x": 0,
                "y": 0,
                "width": img_width,
                "height": img_height,
                "id": svgCanvas.getNextId(),
                "style": "pointer-events:inherit"
              }
            });
            svgCanvas.setHref(newImage, clickDom.target.result);
            svgCanvas.selectOnly([newImage])
            svgCanvas.alignSelectedElements("m", "page")
            svgCanvas.alignSelectedElements("c", "page")
            editor.panel.updateContextPanel();
          }
          // put a placeholder img so we know the default dimensions
          var img_width = 100;
          var img_height = 100;
          var img = new Image()
          img.src = clickDom.target.result
          document.body.appendChild(img);
          img.onload = function() {
            img_width = img.offsetWidth
            img_height = img.offsetHeight
            insertNewImage(img_width, img_height);
            document.body.removeChild(img);
          }
        };
        reader.readAsDataURL(fileKey)
      }, 200);
    } else {
      fileKey = null
    }
  }
  function loadSvgString(str, callback) {
    var success = svgCanvas.setSvgString(str) !== false;
    callback = callback || $.noop;
    if(success) {
      callback(true);
      editor.saveCanvas();
      state.set("canvasTitle", svgCanvas.getDocumentTitle());
    } else {
      $.alert("Error: Unable to load SVG data", function() {
        callback(false);
      });
    }
  }

  function openImage(e){
    $('#menu_bar').removeClass('active')
    const f = this;
    if(f.files.length === 1) {
      svgCanvas.clear();
      var reader = new FileReader();
      reader.onloadend = function(e) {
        loadSvgString(e.target.result);
        editor.canvas.update(true);
      };
      reader.readAsText(f.files[0]);
    }
  }

  function onDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    workarea.style.transform = "scale(1.1)";
  }

  function onDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function onDragLeave(e) {
    workarea.removeAttribute("style");
    e.stopPropagation();
    e.preventDefault();
  }

  function place(){
    $importInput.trigger("click");
  }

  function open(){
    $openInput.trigger("click");
  }

  workarea.addEventListener('dragenter', onDragEnter, false);
  workarea.addEventListener('dragover', onDragOver, false);
  workarea.addEventListener('dragleave', onDragLeave, false);
  workarea.addEventListener('drop', importImage, false);

  this.place = place;
  this.open = open;
  this.loadSvgString = loadSvgString;

}