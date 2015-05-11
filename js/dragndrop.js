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

// Take the hubs in each tier and capture their data and save them.
function saveHubs(){
	// Eventually, this will push to the REST api, but for now, we'll just output the data.
	data = [];
	$('.tier').children('button').each(function(button){
		data.push({'hub-id':button.id, 'parent':button.parent, 'tier-id':$(button).parent().id});
	});

	return data;
}

// A quick and dirty function to render the save data
function renderSaveData(data){
	// Just output the data as a list into the info area.

}

// Only display dashed border
function reActivateTiers(){
	// Get full tiers
	var $full = $('.tier').not(':empty');
	// Get last empty tier
	var $lastEmpty = $('.tier').not(':empty').last();
	// Reactivate those tiers.
	var found = $($full, $lastEmpty).attr('droppable', 'droppable').css({'background':'lightgray'});
	console.log('reattributed', found);
}

// TODO: Have save button display the current layout of hubs in the info area.
// TODO: Only allow lower tiers to be filled first.
// TODO: Change display to allow higher drop tiers to contain multiple tier targets based on the areas below them.
// TODO: Allow dropping of articles onto the target button and hubs onto the target button as a special case, which causes them to be displayed in tier 1.
// TODO: Leave a drop target area in each subhub area
// TODO: Allow hubs within tiers to be dragged to a new order.


$(function(){
	// Prevent default on drop targets
	$(".tier").on("dragover",function(e){
		e.preventDefault();
	});

	// Once drag starts, set the data.
	$(".hub-area button").on("dragstart",function(e){
		// Set the hubId for transferring.
		e.originalEvent.dataTransfer.setData("text",e.target.id);
	});

	var copyId = 1;

	// On drop transfer the data, clone an element, and then place it in the new location.
	$(".tier").on("drop",function(e){
		e.preventDefault();
		// Get the id of the draggable element, must have an id
		var hubId=e.originalEvent.dataTransfer.getData("text");
		console.log('data', hubId, 'target', e.target);
		// Create a clone with new data, but referring to the original.
		var clone = $('#'+hubId).clone().attr("id", hubId+'-copy-'+copyId).data('original-id', hubId);
		copyId++; // Increment the clone ids so they're unique.
		console.log('clone:', clone, 'typeof clone:', typeof(clone));
		e.target.appendChild(clone.get(0));

		//setTimeout(function(){
			reActivateTiers(); // Reborder-ify the tiers as appropriate
		//}, 1*1000);
	});


	$('#save-hubs').hide().submit(function(e){
		e.preventDefault();
		var data = saveHubs();
		renderSaveData(data);
		return false;
	});
});