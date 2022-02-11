## DOMFragment.js
//By Joshua Brewster (AGPL v3.0)


`npm i domfragment`


This is a simple wrapper for the native template fragments in javascript.

DOMElement extends the HTMLElement class and implements a template fragment rendering method, and they become usable like <customelement/> 
and can be extended e.g. 

```js
class customelement extends DOMElement { 
  props={defaultprop:1}:
  template=(props)=>{return `<div>New Element: ${JSON.stringify(props)}</div>`} 
}
```
 
where all that needs to be set is the template variable.

Then this *should* work in html:

```js
<customelement props={a:1,b:2,c:3}/>
```

or

```js

let elm = new customelement(
  {prop2:'abc123'},
  options={ //each function passes 'props'        
    oncreate:undefined, //when the node is created e.g. setting up buttons (props) => {}
    ondelete:undefined, //when the node is deleted, e.g. cleaning up events (props) => {}
    onresize:undefined, //window.onresize event (props) => {}
    onchange:undefined,  //if props change, e.g. re-render? (props) => {}
    template:undefined, //template string `` or function (props) => {return `e.g. ${props}`;}
    name:undefined //e.g. "customelement" can define a custom name for the element here instead of using the class name. Removes need to extend the class
  }
)

```


DOMFragment is the older method as described below, not as clean:


```js
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
