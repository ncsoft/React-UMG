function set_attrs(instance, attrs) {
  for (var k in attrs) {
    set_attr(instance, k, attrs[k]);
  }
}

function set_attr(instance, k, attr) {
  function inner(k) {
    var setter = instance["Set" + k]
    if (setter != undefined) {
      setter.call(instance, attr)
      return true
    } else if (instance[k] != undefined) {
      if (instance[k] instanceof UObject) {
        set_attrs(instance[k], attr)
        return true
      } else {
        try {
          instance[k] = attr
        } catch (e) {
          console.error(String(e), k, JSON.stringify(attr))
        }

        return true
      }
    } else {
      return false
    }
  }

  inner(k) || inner("b" + k)
}
module.exports = {
  set_attrs: set_attrs,
  set_attr: set_attr
}