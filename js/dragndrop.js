function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

$(function(){
	// Prevent default on drop targets
	// Once drag starts, set the data.
	// On drop transfer the data
  $(".tier").on("dragover",function(e){
    e.preventDefault();
  });
  $(".hub-area button").on("dragstart",function(e){
  	// Set the hubId for transferring.
    e.originalEvent.dataTransfer.setData("text",e.target.id);
  });
  $(".tier").on("drop",function(e){
    e.preventDefault();
    // Get the id of the draggable element, must have an id
    var hubId=e.originalEvent.dataTransfer.getData("text");
    console.log('data', hubId, 'target', e.target);
    e.target.appendChild(document.getElementById(hubId));
  });
});