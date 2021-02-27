
if(global.process && global.process.versions && global.process.versions.node){
    delete (global.process as any).versions.node;
}
