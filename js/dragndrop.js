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
			$list.append($('<li></li>').text('Dropped id: ['+el.node+'] Parent-id: ['+el.parent+'] Article-id: ['+el.article+']'));
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
renderer.displayNode = function(nodecounter, node, parent){
	if(!(parent instanceof jQuery)){
		throw 'Tried to drop a hub in a place that isn\'t droppable, sorry.';
	}
	var text = node.text() || 'notext';

	// Take the text of the dropped node, and put it into a new structure in layout tree
	var parentHasSiblings = parent.next('ul').length;
	parent.end();
	// Todo use a template from the html in order to create and render the new node.
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
renderer.dedisplayNode = function($node){
	if(!($node instanceof jQuery)){
		throw 'Please wrap node in jQuery before manipulation';
	}
	$list = $node.closest('ul');// a -> li -> ul
	if($list.children().length < 2){
		$list.remove(); // Remove ul that would be left empty.
	} else { // There are other li siblings.
		$node.parent().remove();
	}
};
// Move a node (actually, it's appropriate parentage)
renderer.shimmyNode = function($node, $landingNode){
	console.log('Shimmy ['+$node.attr('id')+'] onto ['+$landingNode.attr('id')+'] \'s li.');
	if($landingNode.next('ul').length){
		var $newParent = $landingNode.next('ul'); // Add to existing ul.
	} else { // Create a new ul and add it after the <a>
		var $newParent = $('<ul>');
		$landingNode.after($newParent);
	}
	if($newParent.length){
		var $moveMe = $node.closest('li');
		var $removeMe = null;
		// Mark parent ul for destruction if it's empty.
		if($moveMe.siblings('li').length === 0){
			$removeMe = $moveMe.parent();
		}
		$moveMe.detach();
		if($removeMe instanceof jQuery){
			$removeMe.remove();
		}

		$moveMe.appendTo($newParent);
		return true;
	}
	return false;
};
// Just drop the article name into the area, for now.  Better rendering to come.
renderer.markArticle = function($node, $article){
	$node.text('['+$article.text()+'] '+$node.text()); // Fake way of adding an article.
};

/**
 * The tree will store the nodes as a tree structure, and add or remove as needed.
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
	var n = {'parent':parent.attr('id'), 'node':node.attr('id'), 'article':null};
	tree.nodes.push(n);
};
// Traverse the tree and remove the first match.
tree.removeNodeData = function($node){
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
	var success = false;
	// Add the node data to the json list.
	try{
		this.pushNodeData(node, parent);
		success = true;
	} catch(e){
		success = false;
	}
	if(success){
		// Add the node to the display as well.
		tree.renderer.displayNode(newNodeId, node, parent);
	}
	return success;
};
// Pull a node to the trash and derender it's display area.
tree.removeNode = function($node){
	if(!($node instanceof jQuery)){
		throw 'Tree hub not in correct format';
	}
	// Remove the node record.
	tree.renderer.dedisplayNode($node);
	// Remove the rendered node.
	return this.removeNodeData($node);
};
// Move a node (aka just change it's parent)
tree.moveNode = function($node, $newParent){
	var parentId = $newParent.attr('id');
	if(!parentId){
		return false;
	}
	for(var i = tree.nodes.length; i--;) {
		if(tree.nodes[i].node === $node.attr('id')) {
			tree.nodes[i].parent = parentId;
		}
	}
	tree.renderer.shimmyNode($node, $newParent);
};
// Check whether a target and dropped move is acceptable
tree.isAcceptableMove = function($node, $landsOn){
	// Can't drop onto your own descendant
	if($.contains($node, $landsOn)){
		console.log('Ignoring drop on own descendant.');
		return false;
	} else if($node[0] === $landsOn[0]){ // Can't drop on yourself.
		console.log('Ignore dropping on yourself.');
		return false;
	} else if($node.parent().parent()[0] === $landsOn[0]){ // Ignore drop on already-parent element
		console.log('Ignoring drop on already-parent element.');
		return false;
	} else if(($tier = $target.parent().parent('ul')) 
			&& ($tier2 = $tier.parent().parent('ul')) 
			&& ($tier3 = $tier2.parent().parent('ul'))
			&& ($tier4 = $tier3.parent().parent('ul'))
			&& $tier4.length){
		console.log('Trying to drop onto too low of a tier, rejecting');
		return false; // Can'd drop below the 3rd tier.
	} else {
		return true;
	}
};
// Add a certain article to a node.
tree.associateArticle = function($node, $article){
	this.renderer.markArticle($node, $article);
	for(var i = tree.nodes.length; i--;) {
		if(tree.nodes[i].node === $node.attr('id')) {
			tree.nodes[i].article = $article.attr('id');
			return true;
		}
	}
	return false;
};


$(function(){

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
		$target = $(this);
		$dropped = $(document.getElementById(droppedId));
		console.log('Just dropped id: ['+droppedId+'] onto: ['+$target.attr('id')+']');
		if($dropped.hasClass('article') && !$target.hasClass('target')){
			return tree.associateArticle($target, $dropped);
		}
		var moved = false;
		var valid = tree.isAcceptableMove($dropped, $target);
		if(!valid){
			return false;
		}
		if($dropped.hasClass('hub') || $dropped.hasClass('node')){
			if($dropped.hasClass('node')){
				tree.moveNode($dropped, $target); // Just move it.
			} else {
				// If it's type hub, then add it to the tree.
				tree.addNode($dropped, $target);
			}
		} else {
			throw 'Problem determining the type of the dropped info.';
			// Not article, not hub, not node, so what is it?
		}
		if($dropped.hasClass('node') && moved){ // Remove only on successful drop
			tree.removeNode($dropped);
		}
	});

	// Remove a node when it's dropped on the trash.
	$("#remove").on("drop", function(e){
		e.preventDefault();
		var droppedId = e.originalEvent.dataTransfer.getData("text");
		console.log('Remove requested for id: '+droppedId);
		$dropped = $(document.getElementById(droppedId));
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