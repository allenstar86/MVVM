class Observer{
    constructor(data){
        this.observe(data);
    }
    observe(data){
        
        //将data数据将原有的属性改成get和set
        if(!data || typeof data !== 'object'){
            return;
        }
        console.log(data)
        Object.keys(data).forEach(key =>{
            //劫持
            this.defineReactive(data,key,data[key]);
            this.observe(data[key]);
        })
    }
    //定义响应式
    defineReactive(obj,key,value){
        let that = this;
        let dep  = new Dep();//每个变化的数据都会对应一个数组，这个数组是存放所有更新的操作
        console.log(dep)
        Object.defineProperty(obj,key,{
           enumerable:true,
           configurable:true,
           get(){
               console.log(Dep.target)
               Dep.target && dep.addSub(Dep.target);
               return value;
           },
           set(newValue){
               if(newValue != value){
                   that.observe(newValue)
                   value = newValue;
                   console.log(newValue);
                   dep.notify();
               }
           }
       }) 
    }
}
//发布订阅
class Dep{
    constructor(){
        //订阅的数组
        this.subs = []
    }
    addSub(watcher){
        
        this.subs.push(watcher);
        console.log(this.subs)
    }
    notify(){
        this.subs.forEach(watcher=>watcher.update());
    }
}