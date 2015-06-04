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
// Take a node, add it to it's parent, and give it a unique identifier
renderer.addNode = function(nodecounter, node, parent){
	var text = node.text() || 'notext';

	// Take the text of the dropped node, and put it into a new structure in layout tree
	var parentHasSiblings = parent.next('ul').length;
	parent.end();
	var newNode = $('<li><a id="node-'+nodecounter+'" class="node" href="#">'+text+'</a></li>');
	if(!parentHasSiblings){
		var ul = $('<ul>').append(newNode); // Wrap the li in a ul
		parent.after(ul); // Add it after the parent.
	} else {
		// Add node to existing ul
		parent.next('ul').append(newNode);
	}
};
// Remove the rendered node area and all subnodes.
renderer.removeNode = function(node){
	if('string' === typeof(node) && '#' !== node.charAt(0)){
		node = '#'+node; // Prepend Id identifier.
	}
	$(node).parent().remove();
}

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
// Push a node's info onto the data array
tree.pushNodeData = function(node, parent){
	var n = {'parent':parent.attr('id'), 'node':node.attr('id')};
	tree.nodes.push(n);
};
// Traverse the tree and remove the first match.
tree.removeNodeData = function($node){
	tree.nodes
	for(var i = tree.nodes.length; i--;) {
		if(tree.nodes[i].node === $node.attr('id')) {
		  tree.nodes.splice(i, 1); // Remove match.
		  return true;
		}
	}
	return false;
};
// Pop a node into the tree and set it's parent.
tree.addNode = function(node, parent){
	var newNodeId = tree.nodeId++;
	// Add the node data to the json list.
	this.pushNodeData(node, parent);
	// Add the node to the display as well.
	tree.renderer.addNode(newNodeId, node, parent);
};
// Pull a node to the trash and derender it's display area.
tree.removeNode = function($node){
	if(!($node instanceof jQuery)){
		throw 'Tree hub not in correct format';
	}
	// Remove the node record.
	tree.renderer.removeNode($node);
	// Remove the rendered node.
	this.removeNodeData($node);

};


$(function(){

	$('#target').siblings().remove();

	//tree.addNode($('#hub-1'), $('#target'));
	//tree.addNode($('#hub-2'), $('#target'));
	//tree.addNode($('#hub-3'), $('#target'));

	// Once drag starts, set the data.
	$(".hub, .article").on("dragstart",function(e){
		console.log('Element picked up, id: ['+e.target.id+']');
		// Set the hubId for transferring.
		e.originalEvent.dataTransfer.setData("text",e.target.id);
	});
	// Delegated node event checking.
	$('.tree').on('dragstart', '.node', function(e){ // Separated because the link target is overriding
		console.log('Node picked up, id: ['+this.id+']');
		// Set the hubId for transferring.
		e.originalEvent.dataTransfer.setData("text",this.id);
	});

	// Have to prevent dragover to allow dropping on an element.
	$(".tree").on("dragover", "a",function(e){
		e.preventDefault();
	});
	$("#remove").on("dragover", function(e){
		e.preventDefault();
	});

	// Add a hub to a tree when it's dropped.
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

	// Remove a node when it's dropped on the trash.
	$("#remove").on("drop", function(e){
		e.preventDefault();
		var droppedId = e.originalEvent.dataTransfer.getData("text");
		console.log('Remove requested for id: '+droppedId);
		$dropped = $('#'+droppedId);
		if(!($dropped.length)){
			throw 'Dropped element not found!';
		}
		tree.removeNode($dropped);
	});


	$('#save-hubs').on('submit, click', function(e){
		e.preventDefault();
		var data = saveHubs(tree.toJson()); // Global tree
		renderSaveData(data);
		return false;
	});
});