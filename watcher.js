class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm;
        this.expr= expr;
        this.cb = cb;
        this.value = this.get();
    }
    getVal(vm,expr){
        //获取实例上对应的数据
        expr = expr.split('.');
        return expr.reduce((prev,next) => {
            return prev[next];
        },vm.$data);
    }
    get(){
        Dep.target = this;
        let value = this.getVal(this.vm,this.expr);
        Dep.target = null;
        return value;
    }
    //对外暴露的方法
    update(){
        let newValue = this.getVal(this.vm,this.expr);
        let oldValue = this.value;
        console.log(newValue);
        if(newValue != oldValue){
            this.cb(newValue);//对应watch的callback
        }
    }
} 