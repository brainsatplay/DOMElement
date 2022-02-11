// Proper DOM fragment implementation which also creates customElements you can use like <so></so>. High HTML5 performance via template fragments

//extend the DOMElement class with an new name, this name determines the element name (always lower case in the html regardless of class name cases)
export function addCustomElement(cls, name, extend='div') {

    console.log(cls.name)

    if(name) customElements.define(name.toLowerCase(),cls, {extends:extend});
    else customElements.define(cls.name.toLowerCase()+'-',cls, {extends:extend}); //declare the class
}

export function randomId(tag='') {
    return tag+Math.floor(Math.random()*1000000000000000);
}

export class DOMElement extends HTMLElement { 

    props = {test:true};
    template = (props=this.props) => {return `<div> Custom Fragment Props: ${JSON.stringify(props)} </div>`}; //override the default template string by extending the class, or use options.template if calling the base class
    fragment = undefined;

    options={ //each function passes 'props'        
        oncreate:undefined, //when the node is created e.g. setting up buttons (props) => {}
        ondelete:undefined, //when the node is deleted, e.g. cleaning up events (props) => {}
        onresize:undefined, //window.onresize event (props) => {}
        onchange:undefined,  //if props change, e.g. re-render? (props) => {}
    }

    static observedAttributes = ["props","options"];

    attributeChangedCallback(name, old, val) {
        if(name === 'props') {
            let newProps = val;
            Object.assign(this.props,newProps);
            this.state.setState({props:this.props});
        }
        if(name === 'options'){

            let options = val;
            this.options=options;

            if(options.oncreate) {
                this.oncreate = options.oncreate;
            }
            if(options.template) {
                this.template = template; //function or string;

                if(typeof template === 'function') this.templateString = template(this.props); //can pass a function
                else this.templateString = template;
                
                //render the new template
                this.render(this.props);
                this.oncreate(this.props);
            }
            if(options.onresize) {
                try {window.removeEventListener('resize',this.onresize);} catch(err) {}
                this.onresize = options.onresize;
                window.addEventListener('resize',this.onresize);
            }
            if(options.ondelete) {
                this.ondelete = () => {
                    options.ondelete();
                    window.removeEventListener('resize',this.onresize);
                    this.state.unsubscribeTrigger('props');
                }
            }
            if(options.onchange) {
                this.onchange = options.onchange;
                this.state.data.props = this.props;
                this.state.subscribeTrigger('props',this.onchange);
            }

        }
    }

    connectedCallback() {

        if(typeof this.options.oncreate === 'function') {
            this.oncreate = this.options.oncreate;
        }
        
        this.render(this.props);

        if(typeof this.options.onresize === 'function') {
            this.onresize = this.options.onresize;
            window.addEventListener('resize',this.onresize);
        }

        if(typeof this.options.ondelete === 'function') {
            this.ondelete = () => {
                this.options.ondelete();
                window.removeEventListener('resize',this.onresize);
                this.state.unsubscribeTrigger('props');
            }
        }

        if(typeof this.options.onchange === 'function') {
            this.onchange = this.options.onchange;
            this.state.data.props = this.props;
            this.state.subscribeTrigger('props',this.onchange);
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

    get options() {
        return this.options;
    }

    set options(options={}) {
        this.setAttribute('options',options);
    }


    oncreate=(props=this.props)=>{}
    onresize=(props=this.props)=>{}
    ondelete=(props=this.props)=>{}
    onchange=(props=this.props)=>{}

    delete = () => { //deletes self from parentNode
        this.fragment = undefined;
        this.remove();
        this.ondelete(this.props);
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
        } else if (this.options.parent) { //first append for js-specified html
            this.options.parent.appendChild(this);
        }
        this.fragment = fragment;
        this.appendChild(fragment);
        
        this.oncreate(props); //set scripted behaviors
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
                            obj.onchange(this.data[prop]);
                        });
                    }
                }
            }

            return this.pushToState;
        },
        subscribeTrigger(key,onchange=(res)=>{}){
            if(key) {
                if(!this.triggers[key]) {
                    this.triggers[key] = [];
                }
                let l = this.triggers[key].length;
                this.triggers[key].push({idx:l, onchange:onchange});
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
        subscribeTriggerOnce(key=undefined,onchange=(value)=>{}) {
            let sub;
            let changed = (value) => {
                onchange(value);
                this.unsubscribeTrigger(key,sub);
            }

            sub = this.subscribeTrigger(key,changed);
        }
    }
}
