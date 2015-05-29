// Take the hubs in each tier and capture their data and save them.
function saveHubs(tree){
	// Eventually, this will push to the REST api, but for now, we'll just output the data.

	// Turn tree into json.
	return tree.toJson();
}

// A quick and dirty function to render the save data
function renderSaveData(data){
	// Just output the data as a list into the info area.
	if(data && data.length){
		var $list = $('<ul></ul>');
		$(data).each(function(index, el){
			console.log(el);
			$list.append($('<li></li>').text('Dropped id: ['+el.hubId+'] Parent-id: ['+el.parent+']'));
		});
		$('#just-info').empty().append($list);
	} else {
		console.log('No save data to render.');
	}
}

// TODO: Have save button display the current layout of hubs in the info area.
// TODO: Only allow lower tiers to be filled first.
// TODO: Change display to allow higher drop tiers to contain multiple tier targets based on the areas below them.
// TODO: Allow dropping of articles onto the target button and hubs onto the target button as a special case, which causes them to be displayed in tier 1.
// TODO: Leave a drop target area in each subhub area
// TODO: Allow hubs within tiers to be dragged to a new order.

/**
 * The renderer is passed to the tree structure to render when nodes are added or dropped.
 * It will add li a elements to the tree
 */
var renderer = renderer || {};
renderer.addNode = function(){
};

/**
 * The tree will store the nodes as a tree structure, and add or remove as needed.
 *
 */
var tree = {};
tree.nodes = [];
tree.nodeId = 1;
// Render nodes as json with type, id, and parent
tree.toJson = function(){
	return {hubId:5,parent:7};
};
tree.addNode = function(node, parent){
	// Add the node data to the json list.
	// Add the node to the display as well.
	var text = node.text() || 'notext';
	var newNodeId = tree.nodeId++;
	// Take the text of the dropped node, and put it into a new structure in layout tree
	var parentHasSiblings = parent.next('ul').length;
	parent.end();
	var newNode = $('<li><a id="node-'+newNodeId+'" href="#">'+text+'</a></li>');
	if(!parentHasSiblings){
		var ul = $('<ul>').append(newNode); // Wrap the li in a ul
		parent.after(ul); // Add it after the parent.
	} else {
		// Add node to existing ul
		parent.next('ul').append(newNode);
	}
};
tree.removeNode = function(node){

};


$(function(){

	$('#target').siblings().remove();

	tree.addNode($('hub-1'), $('#target'));
	tree.addNode($('hub-2'), $('#target'));

	$(".tree a").on("dragover",function(e){
		e.preventDefault();
	});

	// Once drag starts, set the data.
	$(".hub, .article").on("dragstart",function(e){
		// Set the hubId for transferring.
		e.originalEvent.dataTransfer.setData("text",e.target.id);
	});

	var copyId = 1;
	$(".tree a").on("drop",function(e){
		e.preventDefault();
		// Get the id of the draggable element, must have an id
		var droppedId=e.originalEvent.dataTransfer.getData("text");
		console.log('data', droppedId, 'target', e.target);
		console.log('landing-pad\'s id:', $(this).attr('id'));
		// If it's type hub, then add it to the tree.
		tree.addNode($('#'+droppedId), $(this));
		// If it's type article, then make it the article of the node.
	});


	$('#save-hubs').on('submit, click', function(e){
		e.preventDefault();
		var data = saveHubs(tree); // Global tree
		renderSaveData(data);
		return false;
	});
});