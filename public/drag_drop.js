function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {	
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    if (event.target.nodeName !== "IMG") {
    ev.target.appendChild(document.getElementById(data));
}
}

function removeElement(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	document.getElementById(data).style.display='none';
}

/*==========================================================================================================================================*/
/*UPLOAD IN GALLERY FUNCTION*/

window.onload = function(){
        
    if(window.File && window.FileList && window.FileReader)
    {
        var filesInput = document.getElementById("files");
        
        filesInput.addEventListener("change", function(event){
            
            var files = event.target.files;
            var output = document.getElementById("result");
            
            for(var i = 0; i< files.length; i++)
            {
                var file = files[i];
                
                if(!file.type.match('image'))
                  continue;
                
                var picReader = new FileReader();
                
                picReader.addEventListener("load",function(event){
                    
                    var picFile = event.target;
                    
                    window.thumbId = (window.thumbId || 0) + 1;

                    
                    $('<div id="placeholder_gallery" ondrop="drop(event)" ondragover="allowDrop(event)"></div>').appendTo('#gallery').append("<img class='img_size' id='thumbnail" +window.thumbId+" 'draggable='true' ondragstart='drag(event)' src='" + picFile.result + "'" +
                            "title='" + picFile.name + "'/>");           
                
                });
                
                picReader.readAsDataURL(file);
            }                               
           
        });
    }
    else
    {
        console.log("Your browser does not support File API");
    }
}