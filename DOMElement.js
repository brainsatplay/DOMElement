// Proper DOM fragment implementation which also creates customElements you can use like <so></so>. High HTML5 performance via template fragments

//extend the DOMElement class with an new name, this name determines the element name (always lower case in the html regardless of class name cases)
export class DOMElement extends HTMLElement { 

    props = {test:true};
    template = (props=this.props) => {return `<div>Custom Fragment Props: ${JSON.stringify(props)}</div>`}; //override the default template string by extending the class, or use options.template if calling the base class
    fragment = undefined;
    
    options={ //each function passes 'props'        
        oncreate:undefined, //when the node is created e.g. setting up buttons (props) => {}
        ondelete:undefined, //when the node is deleted, e.g. cleaning up events (props) => {}
        onresize:undefined, //window.onresize event (props) => {}
        onchange:undefined,  //if props change, e.g. re-render? (props) => {}
        template:undefined, //template string or function (props) => {return `e.g. ${props}`;}
        name:undefined //e.g. "customelement" can define a custom name for the element here instead of using the class name. Removes need to extend the class
    }

    constructor( 
        props=undefined, //props to render a template string function
        options={ //each function passes 'props'        
            oncreate:undefined, //when the node is created e.g. setting up buttons (props) => {}
            ondelete:undefined, //when the node is deleted, e.g. cleaning up events (props) => {}
            onresize:undefined, //window.onresize event (props) => {}
            onchange:undefined,  //if props change, e.g. re-render? (props) => {}
            template:undefined, //template string `` or function (props) => {return `e.g. ${props}`;}
            name:undefined //e.g. "customelement" can define a custom name for the element here instead of using the class name. Removes need to extend the class
        }
    ) {
        super();

        if(props) {
            Object.assign(this.props,props);
        }
        //create template
        //append node

        this.options=options;

        if(options.template) {
           this.template = template; //function or string;

            if(typeof template === 'function') this.templateString = template(this.props); //can pass a function
            else this.templateString = template;
        }

        //render the template
        this.render(this.props);

        if(options.oncreate) {
            this.oncreate = options.oncreate;
            this.oncreate(this.props);
        }
        if(options.onresize) {
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

        if(options.name) customElements.define(options.name.toLowerCase(),this); //declare the class
        else customElements.define(this.constructor.name.toLowerCase(),this); //declare the class
    }

    get props() {
        return this.props;
    } 

    set props(newProps={}) {
        Object.assign(this.props,newProps);
    }

    get options(options) {
        
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

        if(options.name) customElements.define(options.name.toLowerCase(),this); //declare the class

        return this.options;
    }

    set options() {

    }

    oncreate=(props=this.props)=>{}
    onresize=(props=this.props)=>{}
    ondelete=(props=this.props)=>{}
    onchange=(props=this.props)=>{}

    remove = () => {
        this.parentNode.removeChild(this);
        this.ondelete(this.props);
    };

    render = (props=this.props) => {

        if(typeof this.template === 'function') this.templateString = template(props); //can pass a function
        else this.templateString = this.template;

        const t = document.createElement('template');
        t.innerHTML = this.templateString;
        const fragment = t.content;
        if(this.fragment) this.removeChild(this.fragment); 
        this.fragment = fragment;
        this.appendChild(fragment);
        this.oncreate(props);
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

