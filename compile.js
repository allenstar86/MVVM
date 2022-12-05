class Compile{
    constructor(el,vm){
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        if(this.el){
            //1.把真实的dom移入内存中fragment
            let fragment = this.node2fragment(this.el);
            
            //2.编译 => 提取想要的元素节点v-model和文本节点{{}}
            this.compile(fragment);
            //3.把编译好的fragment塞回页面
            this.el.appendChild(fragment)
        }
    }
    /*辅助方法*/
    isElementNode(node){
        return node.nodeType === 1;
    }

    isDirective(name){
        return name.includes('v-')
    }

    /*核心方法 */
    compileElement(node){
        //带v-model
        let attrs = node.attributes;
        Array.from(attrs).forEach(attr => {
            //判断属性名字是否包含v-
            let attrName = attr.name;
            if(this.isDirective(attrName)){
                //取到对应的值放到节点中
                let expr = attr.value;
                let [,type] = attrName.split('-');
                //node this.vm.$data expr
                CompileUtil[type](node, this.vm, expr);

            }
        })
    }
    compileText(node){
        //带{{}}
        let expr = node.textContent;
        let reg = /\{\{([^}]+)\}\}/g
        if(reg.test(expr)){
            //node this.vm.$data expr
            CompileUtil['text'](node, this.vm, expr);
        }
    }
    compile(fragment){
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node =>{
            if(this.isElementNode(node)){
                //编译元素
                this.compileElement(node);
                this.compile(node)
            }else{
                this.compileText(node);
            }
        })
    }
    node2fragment(el){
        //文档碎片
        let fragment = document.createDocumentFragment();
        let firstChild;
        while(firstChild = el.firstChild){
            fragment.appendChild(firstChild);
        }
        return fragment; //内存中的节点
    }
}

CompileUtil = {
    getVal(vm,expr){
        //获取实例上对应的数据
        expr = expr.split('.');
        return expr.reduce((prev,next) => {
            return prev[next];
        },vm.$data)
    },
    getTextVal(vm,expr){
        return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments) =>{
            return this.getVal(vm,arguments[1]);
        })
    },
    text(node,vm,expr){
        //文本处理
        let updaterFn = this.updater['textUpdater'];
        let value = this.getTextVal(vm,expr);
        expr.replace(/\{\{([^}]+)\}\}/g,(...arguments) =>{
            new Watcher(vm,arguments[1],(newValue)=>{
                //如果数据变化了文本节点需要重新获取依赖的属性更新文本中的值
                updaterFn && updaterFn(node, this.getTextVal(vm,expr));
            }); 
        })
        
        updaterFn && updaterFn(node,value);
    },
    setVal(vm,expr,value){
        expr = expr.split('.');
        return expr.reduce((prev,next,currentIndex)=>{
            if(currentIndex === expr.length-1){
                return prev[next] = value;
            }
            return prev[next];
        },vm.$data)
    },
    model(node,vm,expr){
        //输入框处理
        //文本处理
        let updaterFn = this.updater['modelUpdater'];
        //这里添加监控 数据变化了就调用callback
        new Watcher(vm,expr,(newValue)=>{
            updaterFn && updaterFn(node, this.getVal(vm,expr));
        });
        node.addEventListener('input',(e)=>{
            let newValue = e.target.value;
            this.setVal(vm,expr,newValue);
        })
        updaterFn && updaterFn(node, this.getVal(vm,expr));
    },
    updater:{
        textUpdater(node,value){
            node.textContent = value;
        },
        modelUpdater(node,value){
            node.value = value;
        }
    }
}