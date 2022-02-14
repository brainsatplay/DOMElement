
export class DOMElement extends HTMLElement { 
    template = (props) => {return `<div> Custom Fragment Props: ${JSON.stringify(props)} </div>`}; //override the default template string by extending the class, or use options.template if calling the base class
    props = {test:true};
    
    oncreate=undefined //(props) => {}  fires on element creation (e.g. to set up logic)
    onresize=undefined //(props) => {} fires on window resize
    ondelete=undefined //(props) => {} fires after element is deleted
    onchanged=undefined //(props) => {} fires when props change

    fragment = undefined;

    obsAttributes=["props","options","onchanged","onresize","ondelete","oncreate","template"]
 
    get observedAttributes() {
        return this.obsAttributes;
    }

    get obsAttributes() {
        return this.obsAttributes;
    }

    set obsAttributes(att) {
        if(typeof att === 'string') {
            this.obsAttributes.push(att);
        } else if (Array.isArray(att)) this.obsAttributes=att;
    }

    attributeChangedCallback(name, old, val) {
        if(name === 'onchanged') {
            let onchanged = val;
            if(typeof onchanged === 'string') onchanged = parseFunctionFromText(onchanged);
            if(typeof onchanged === 'function') { 
                this.onchanged =  onchanged;
                this.state.data.props = this.props;
                this.state.unsubscribeTrigger('props'); //remove any previous subs
                this.state.subscribeTrigger('props',this.onchanged);
                let changed = new CustomEvent('changed', {detail: { props:this.props }});
                this.state.subscribeTrigger('props',()=>{this.dispatchEvent(changed)});
            }
        }
        else if(name === 'onresize') {
            let onresize = val;
            if(typeof onresize === 'string')  onresize = parseFunctionFromText(onresize);
            if(typeof onresize === 'function') { 
                try {window.removeEventListener('resize',this.onresize);} catch(err) {}
                this.onresize = onresize;
                window.addEventListener('resize',this.onresize);
            }
        }
        else if(name === 'ondelete') {
            let ondelete = val;
            if(typeof ondelete === 'string') ondelete = parseFunctionFromText(ondelete);
            if(typeof ondelete === 'function') { 
                this.ondelete = () => {
                    window.removeEventListener('resize',this.onresize);
                    this.state.unsubscribeTrigger('props');
                    ondelete();
                }
            }
        }
        else if(name === 'oncreate') { 
            let oncreate = val;
            if(typeof oncreate === 'string') oncreate = parseFunctionFromText(oncreate);
            if(typeof oncreate === 'function') { 
                this.oncreate =  oncreate;
            }
        }
        else if(name === 'props') { //update the props, fires any onchanged stuff
            let newProps = val;
            if(typeof newProps === 'string') newProps = JSON.parse(newProps);

            Object.assign(this.props,newProps);
            this.state.setState({props:this.props});
        }
        else if(name === 'template') { //change the html template

            let template = val;

            this.template = options.template; //function or string;

            if(typeof template === 'function') this.templateString = this.template(this.props); //can pass a function
            else this.templateString = template;
            
            //render the new template
            this.render(this.props);
            let created = new CustomEvent('created', {detail: { props:this.props }});
            this.dispatchEvent(created);

        }
        else { //arbitrary attributes
            let parsed = val;
            if(name.includes('eval_')) { // e.g. <custom-  eval_loginput="(input)=>{console.log(input);}"></custom-> //now elm.loginput(input) should work
                name = name.split('_').shift()
                name = name.join();
                parsed = parseFunctionFromText(val);  
            }
            else if (typeof val === 'string') {
                parsed = JSON.parse(val)
            }
            
            this[name] = parsed; // set arbitrary props 
            this.props[name] = parsed; //reflect it in the props object (to set props via attributes more easily)
            //this.props[name] = val; //set arbitrary props via attributes
        }
    }

    connectedCallback() {

        // set initial props
        let newProps = this.getAttribute('props');
        if(typeof newProps === 'string') newProps = JSON.parse(newProps);

        Object.assign(this.props,newProps);
        this.state.setState({props:this.props});


        //Observe arbitrary attributes
        Array.from(this.attributes).forEach((att) => {
            let name = att.name;
            //console.log(name,this.getAttribute(name),this[name])
            if(!this[name]) { //get/set/observe arbitrary attributes
                let parsed = att.value;
                if(name.includes('eval_')) { // e.g. <custom-  eval_loginput="(input)=>{console.log(input);}"></custom-> //now elm.loginput(input) should work
                    name = name.split('_').shift()
                    name = name.join();
                    parsed = parseFunctionFromText(att.value);  
                }
                else if (typeof att.value === 'string') {
                    parsed = JSON.parse(att.value)
                }
                Object.defineProperties(
                    this, att, {
                        value:parsed,
                        writable:true,
                        get() { return this[name]; },
                        set(val) { this.setAttribute(name, val); }
                    }
                )
                this.props[name] = parsed; //set on props too (e.g. to more easily modify initial conditions without stringifying an object)
                this.obsAttributes.push(name);
            }
            
            //console.log(this.observedAttributes);
        })

        let resizeevent = new CustomEvent('resized', {detail: { props:this.props }});
        let changed = new CustomEvent('changed', {detail: { props:this.props }});
        let deleted = new CustomEvent('deleted', {detail: { props:this.props }});
        let created = new CustomEvent('created', {detail: { props:this.props }});
        //now we can add event listeners for our custom events

        this.render(this.props);
        this.dispatchEvent(created);

        this.state.subscribeTrigger('props',()=>{this.dispatchEvent(changed)});

        if(typeof this.onresize === 'function') {
            window.addEventListener('resize',()=>{
                this.onresize();
                this.dispatchEvent(resizeevent);
            });
        }

        if(typeof this.ondelete === 'function') {
            let ondelete = this.ondelete;
            this.ondelete = () => {
                window.removeEventListener('resize',this.onresize);
                this.state.unsubscribeTrigger('props');
                ondelete();
                this.dispatchEvent(deleted);
            }
        }

        if(typeof this.onchanged === 'function') {
            this.state.data.props = this.props;
            this.state.subscribeTrigger('props',this.onchanged);
        }

    }

    constructor() {
        super();
    }

    get props() {
        return this.props;
    } 

    set props(newProps={}) {
        this.setAttribute('props',newProps);
    }

    get template() {
        return this.template;
    } 

    set template(template) {
        this.setAttribute('template',template);
    }

    get render() {
        return this.render;
    }

    get delete() {
        return this.delete;
    }

    get state() {
        return this.state;
    }

    //past tense just so it can't conflict with onchange
    get onchanged() {
        return this.onchanged;
    } 

    set onchanged(onchanged) {
        this.setAttribute('onchanged',onchanged);
    }

    get onresize() {
        return this.props;
    } 

    set onresize(onresize) {
        this.setAttribute('onresize',onresize);
    }

    get ondelete() {
        return this.props;
    } 

    set ondelete(ondelete) {
        this.setAttribute('ondelete',ondelete);
    }

    get oncreate() {
        return this.oncreate;
    } 

    set oncreate(oncreate) {
        this.setAttribute('oncreated',oncreate);
    }


    delete = () => { //deletes self from the DOM
        this.fragment = undefined;
        this.remove();
        if(this.ondelete) this.ondelete(this.props);
    };

    render = (props=this.props) => {

        if(typeof this.template === 'function') this.templateString = this.template(props); //can pass a function
        else this.templateString = this.template;

        //this.innerHTML = this.templateString;

        const t = document.createElement('template');
        t.innerHTML = this.templateString;
        const fragment = t.content;
        if(this.fragment) { //will reappend the fragment without reappending the whole node if already rendered once
            this.removeChild(this.fragment); 
        }
        this.fragment = fragment;
        this.appendChild(fragment);
        
        if(this.oncreate) this.oncreate(props); //set scripted behaviors
    }

    state = {
        pushToState:{},
        data:{},
        triggers:{},
        setState(updateObj){
            Object.assign(this.pushToState,updateObj);

            if(Object.keys(this.triggers).length > 0) {
                // Object.assign(this.data,this.pushToState);
                for (const prop of Object.getOwnPropertyNames(this.triggers)) {
                    if(this.pushToState[prop]) {
                        this.data[prop] = this.pushToState[prop]
                        delete this.pushToState[prop];
                        this.triggers[prop].forEach((obj)=>{
                            obj.onchanged(this.data[prop]);
                        });
                    }
                }
            }

            return this.pushToState;
        },
        subscribeTrigger(key,onchanged=(res)=>{}){
            if(key) {
                if(!this.triggers[key]) {
                    this.triggers[key] = [];
                }
                let l = this.triggers[key].length;
                this.triggers[key].push({idx:l, onchanged:onchanged});
                return this.triggers[key].length-1;
            } else return undefined;
        },
        unsubscribeTrigger(key,sub){
            let idx = undefined;
            let triggers = this.triggers[key]
            if (triggers){
                if(!sub) delete this.triggers[key];
                else {
                    let obj = triggers.find((o)=>{
                        if(o.idx===sub) {return true;}
                    });
                    if(obj) triggers.splice(idx,1);
                    return true;
                }
            }
        },
        subscribeTriggerOnce(key=undefined,onchanged=(value)=>{}) {
            let sub;
            let changed = (value) => {
                onchanged(value);
                this.unsubscribeTrigger(key,sub);
            }

            sub = this.subscribeTrigger(key,changed);
        }
    }
}

//extend the DOMElement class with an new name, this name determines the element name (always lower case in the html regardless of class name cases)
export function addCustomElement(cls, name, extend=null) {
    if(extend) {
        if(name) window.customElements.define(name, cls, {extends:extend});
        else window.customElements.define(cls.name.toLowerCase()+'-',cls, {extends:extend});
    }
    else {
        if(name) window.customElements.define(name, cls);
        else window.customElements.define(cls.name.toLowerCase()+'-',cls);
    }
}

export function randomId(tag='') {
    return tag+Math.floor(Math.random()*1000000000000000);
}

// Proper DOM fragment implementation which also creates customElements you can use like <so></so>. High HTML5 performance via template fragments
export function parseFunctionFromText(method) {
    //Get the text inside of a function (regular or arrow);
    let getFunctionBody = (methodString) => {
    return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, '$2$3$4');
    }

    let getFunctionHead = (methodString) => {
    let startindex = methodString.indexOf(')');
    return methodString.slice(0, methodString.indexOf('{',startindex) + 1);
    }

    let newFuncHead = getFunctionHead(method);
    let newFuncBody = getFunctionBody(method);

    let newFunc;
    try{
        if (newFuncHead.includes('function ')) {
            let varName = newFuncHead.split('(')[1].split(')')[0]
            newFunc = new Function(varName, newFuncBody);
        } else {
            if(newFuncHead.substring(0,6) === newFuncBody.substring(0,6)) {
                //newFuncBody = newFuncBody.substring(newFuncHead.length);
                let varName = newFuncHead.split('(')[1].split(')')[0]
                //console.log(varName, newFuncHead ,newFuncBody);
                newFunc = new Function(varName, newFuncBody.substring(newFuncBody.indexOf('{')+1,newFuncBody.length-1));
            }
            else newFunc = eval(newFuncHead + newFuncBody + "}");
            }
        }
    catch (err) {}

    return newFunc;

}

