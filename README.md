## DOMElement.js
//By Joshua Brewster (AGPL v3.0)


`npm i fragelement`

[fragelement-based webcomponent app example](https://github.com/moothyknight/esbuild_base_webcomponents)

This is a simple wrapper for the native web components with template fragments in javascript.

DOMElement extends the HTMLElement class and implements a template fragment rendering method:


Extend it like:
```js
class customelement extends DOMElement { 
  props={defaultprop:1}:

  //The template can be an imported html file when building in node.js for a better experience
  template=(props)=>{return `<div>New Element: ${JSON.stringify(props)}</div>`} 
         
  oncreate=undefined, //(props)=>{} when the node is created e.g. setting up buttons (props) => {}
  ondelete=undefined, //(props)=>{} when the node is deleted, e.g. cleaning up events (props) => {}
  onresize=undefined, //window.onresize event (props) => {}
  onchanged=undefined, //if props change, e.g. re-render? (props) => {}. Using past tense to not conflict with built in onchange event in most elements
  
}

addCustomElement(customelement); //adds the custom class to the registry before instantiating the new element
```
 
where all that needs to be set is the template variable.

Then this *should* work in html:

```html
<customelement- props='{"a":"1","b":"2","c":"3"}'><customelement- /> 
```
Can define props, onresize, onchanged, oncreate, ondelete, and even template just like other stock html functions.


```js
let elm = document.querySelector('customelement-');

elm.addEventListener('resized',(e) => {
  console.log(e.target.props);
});

elm.addEventListener('changed',(e) => {
  console.log(e.target.props);
});

elm.addEventListener('deleted',(e) => {
  console.log(e.target.props);
});

```

Custom elements have to have a '-' in the names for whatever reason, they are auto added on the end of the class name if none specified in addCustomElement

Even more fun:

```html
<body>
    <script>
        function foo(x=123){ console.log(x) }
    </script>


    <customelement- props='{"a":"1"}' testvalue="123" eval_foo="foo(456)"></customelement->

    <script>
      
        let elem = document.getElementsByTagName('customelement-')[0];
        console.log(Array.from(elem.attributes)); //see dynamically added attributes, the eval_ will be evaluated (can even add or set functions)
        console.log(elem.props)
        console.log(elem.testvalue);
    </script>
</body>
```



#### DOMFragment is an older method as described below, not as clean:
IOS does not like this method.

`npm i domfragment`

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
