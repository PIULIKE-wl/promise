class Promise{
    //构造方法
    constructor(executor){
         //对象初始状态
    this.PromiseState = 'pending';
    this.PromiseResult = null;
    const self = this;
    this.callbacks = [];
    //成功
    function resolve(data){
        //确保只能改变一次状态
        if(self.PromiseState !== 'pending')
        {
            return;
        }
        self.PromiseState = 'fulfilled';
        self.PromiseResult = data;
        setTimeout(() => {
            self.callbacks.forEach(item=>{
                item.resolved(data);
            })
        });
    }
    //失败
    function reject(data){
        if(self.PromiseState !== 'pending')
        {
            return;
        }
        self.PromiseState = 'rejected';
        self.PromiseResult = data;
        setTimeout(() => {
            self.callbacks.forEach(item=>{
                item.rejected(data);
            })
        });
    }

    try {
        executor(resolve,reject);
    } catch (error) {
        reject(error);
    }
    }

    //then方法封装
    then(resolved,rejected){
        const self = this;
        //默认设置
        if(typeof rejected !== 'function')
        {
            rejected = reason=>{
                throw reason;
            }
        }
        if(typeof resolved !== 'function')
        {
            resolved = value => value;//value=>{return value}
        }
        return new Promise((resolve,reject)=>{
            //封装函数
            function callback(type){
                try {
                    let result = type(self.PromiseResult);
                    if(result instanceof Promise)
                    {
                        result.then(v=>{
                            resolve(v);
                        },r=>{
                            reject(r);
                        });
                    }
                    else
                    {
                        resolve(result);
                    }
        
                } catch (error) {
                    reject(error);
                }
            }
            if(this.PromiseState === 'fulfilled')
            {
               setTimeout(() => {
                callback(resolved);
               });
            }
    
            if(this.PromiseState === 'rejected')
            {
                setTimeout(() => {
                    callback(rejected);
                });
            }
            //异步任务
            if(this.PromiseState === 'pending')
            {
                this.callbacks.push({
                    resolved:function(){
                        callback(resolved);
                    },
                    rejected:function(){
                        callback(rejected);
                    }
                });
            }
        
        })
    }

    //catch方法封装
    catch(rejected){
        return this.then(undefined,rejected);
    }

    //resolve方法,不属于实例对象，用static标识静态成员
    static resolve(value){
        return new Promise((resolve,reject)=>{
            if(value instanceof Promise)
            {
                value.then(v=>{
                    resolve(v);
                },r=>{
                    reject(r);
                })
            }
            else
            {
                resolve(value);
            }
        })
    }

    //reject方法,不属于实例对象，用static标识静态成员
    static reject(reason){
        return new Promise((resolve,reject)=>{
            reject(reason);
        })
    }

    //all方法
    static all(promises){
        return new Promise((resolve,reject)=>{
            let count = 0;
            let arr = [];
            for(let i=0;i<promises.length;i++)
            {
                promises[i].then(v=>{
                    count++;
                    arr[i] = v;
                    if(count === promises.length)
                    {
                        resolve(arr);
                    }
                },r=>{
                    reject(r);
                });
            }
        })
    }

    //race方法
    static race(promises){
        return new Promise((resolve,reject)=>{
            for(let i=0;i<promises.length;i++)
            {
                promises[i].then(v=>{
                    resolve(v);
                },r=>{
                    reject(r);
                });
            }
        });
    }
}



//添加then方法
//Promise.prototype.then = function(resolved,rejected){}
//catch方法
//Promise.prototype.catch = function(rejected){}
//resolve方法
//Promise.resolve = function(value){}
//reject方法
//Promise.reject = function(reason){}
//all方法
//Promise.all = function(promises){}
//race方法
//Promise.race = function(promises){}