## DOMFragment.js

`npm i domfragment`


This is a simple wrapper for the native template fragments in javascript.
It's not like lithtml or React where you get custom text recognition
for the html, just good passing old template strings. This lets you set up
the various event handlers for the component you are rendering when you create the fragment easily, offloading a lot of HTML and javascript spaghetti and rendering as high performance DOM fragments. iOS or some browsers will complain, but screw them :P 



//By Joshua Brewster (AGPL v3.0)

```
import {DOMFragment} from 'domfragment'


const htmlprops = {
  id:'template1'
};

function templateStringGen(props) { //write your html in a template string
    return `
    <div id=${props.id}>Clickme</div>
    `;
}

function onRender(props) { //setup html
    document.getElementById(props.id).onclick = () => { 
      document.getElementById(props.id).innerHTML = "Clicked!"; 
    }
}

function onchange(props) { //optional if you want to be able to auto-update the html with changes to the properties, not recommended if you only want to update single divs
  console.log('props changed!', props);
}

function ondelete(props) { //called before the node is deleted, use to clean up animation loops and event listeners
}

function onresize() { //adds a resize listener to the window, this is automatically cleaned up when you delete the node.
}

const fragment = new DOMFragment(
                        templateStringGen,
                        document.body,
                        htmlprops,
                        onRender,
                        undefined, //onchange
                        "NEVER", //"FRAMERATE" //1000
                        ondelete,
                        onresize
                      ); 
                      
//... later ...
fragment.deleteNode(); //deletes the rendered fragment if you are done with it.


```
