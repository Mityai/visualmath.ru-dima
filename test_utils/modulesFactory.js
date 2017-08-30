global.modulesFactory = (name, author, content, script) => {
  return new ModuleMongo({name, content, script, author}).save()
}
