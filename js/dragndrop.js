// Take the hubs in each tier and capture their data and save them.
function saveHubs(json_data){
	// Eventually, this will push to the REST api, but for now, we'll just output the data.

	// Turn tree into json.
	return json_data;
}

// A quick and dirty function to render the save data
function renderSaveData(data){
	// Just output the data as a list into the info area.
	if(data && data.length){
		var $list = $('<ul></ul>');
		$(data).each(function(index, el){
			console.log(el);
			$list.append($('<li></li>').text('Dropped id: ['+el.node+'] Parent-id: ['+el.parent+']'));
		});
		$('#just-info').empty().append($list);
	} else {
		console.log('No save data to render.');
	}
}

/**
 * The renderer is passed to the tree structure to render when nodes are added or dropped.
 * It will add li a elements to the tree
 */
var renderer = renderer || {};
renderer.addNode = function(nodecounter, node, parent){
	var text = node.text() || 'notext';

	// Take the text of the dropped node, and put it into a new structure in layout tree
	var parentHasSiblings = parent.next('ul').length;
	parent.end();
	var newNode = $('<li><a id="node-'+nodecounter+'" href="#">'+text+'</a></li>');
	if(!parentHasSiblings){
		var ul = $('<ul>').append(newNode); // Wrap the li in a ul
		parent.after(ul); // Add it after the parent.
	} else {
		// Add node to existing ul
		parent.next('ul').append(newNode);
	}
};

/**
 * The tree will store the nodes as a tree structure, and add or remove as needed.
 *
 */
var tree = {};
tree.nodes = [];
tree.nodeId = 1;
tree.renderer = renderer;
// Render nodes as json with type, id, and parent
tree.toJson = function(){
	return tree.nodes;
};
tree.nodeData = function(node, parent){
	var n = {'parent':parent.attr('id'), 'node':node.attr('id')};
	tree.nodes.push(n);
};
tree.addNode = function(node, parent){
	var newNodeId = tree.nodeId++;
	// Add the node data to the json list.
	this.nodeData(node, parent);
	// Add the node to the display as well.
	tree.renderer.addNode(newNodeId, node, parent);
};
tree.removeNode = function(node){

};


$(function(){

	$('#target').siblings().remove();

	tree.addNode($('#hub-1'), $('#target'));
	tree.addNode($('#hub-2'), $('#target'));

	// Once drag starts, set the data.
	$(".hub, .article").on("dragstart",function(e){
		// Set the hubId for transferring.
		e.originalEvent.dataTransfer.setData("text",e.target.id);
	});

	$(".tree").on("dragover", "a",function(e){
		e.preventDefault();
	});

	$(".tree").on("drop", "a", function(e){ // Delegated
		e.preventDefault();
		// Get the id of the draggable element, must have an id
		var droppedId=e.originalEvent.dataTransfer.getData("text");
		console.log('data', droppedId, 'target', e.target);
		console.log('landing-pad\'s id:', $(this).attr('id'));
		$target = $(this);
		$dropped = $('#'+droppedId);
		console.log('Dropped has class is: '+$dropped.hasClass('hub'));
		if($dropped.hasClass('hub')){
			// If it's type hub, then add it to the tree.
			tree.addNode($dropped, $target);
		} else {
			// TODO: If it's type article, then make it the article of the node.
			return false;
		}
	});


	$('#save-hubs').on('submit, click', function(e){
		e.preventDefault();
		var data = saveHubs(tree.toJson()); // Global tree
		renderSaveData(data);
		return false;
	});
});