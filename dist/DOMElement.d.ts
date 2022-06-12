export function addCustomElement(cls: any, tag: any, extend?: any): void;
export function randomId(tag?: string): string;
export function parseFunctionFromText(method: any): any;
export class DOMElement extends HTMLElement {
    static get tag(): string;
    static addElement(tag?: string, cls?: typeof DOMElement, extend?: any): void;
    template: (props: any) => string;
    props: {
        test: boolean;
    };
    useShadow: boolean;
    styles: string;
    oncreate: (props:any,self:any)=>void;
    onresize:  ((props:any,self:any)=>void)|any;
    ondelete:  (props:any,self:any)=>void;
    onchanged:  (props:any,self:any)=>void;
    renderonchanged: boolean|((props:any,self:any)=>void);
    FRAGMENT: any;
    attachedShadow: boolean;
    obsAttributes: string[];
    get observedAttributes(): string[];
    attributeChangedCallback(name: any, old: any, val: any): void;
    ONRESIZE: ((ev: any) => void) | undefined;
    templateString: any;
    connectedCallback(): void;
    delete: () => void;
    render: (props?: {
        test: boolean;
    }) => void;
    state: {
        pushToState: {};
        data: {};
        triggers: {};
        setState(updateObj: any): {};
        subscribeTrigger(key: any, onchanged?: (res: any) => void): number | undefined;
        unsubscribeTrigger(key: any, sub: any): true | undefined;
        subscribeTriggerOnce(key?: undefined, onchanged?: (value: any) => void): void;
    };
}
