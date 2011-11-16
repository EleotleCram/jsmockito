// vi:ts=2 sw=2 expandtab

/**
 * Create a mockable and stubbable objects.
 *
 * <p>A mock is created with the constructor for an object as an argument.
 * Once created, the mock object will have all the same methods as the source
 * object which, when invoked, will return undefined by default.</p>
 *
 * <p>Stub declarations may then be made for these methods to have them return
 * useful values or perform actions when invoked.</p>
 *
 * <pre>
 * MyObject = function() {
 *   this.add = function(a, b) { return a + b }
 * };
 *
 * var mockObj = JsMockito.mock(MyObject);
 * mockObj.add(5, 4); // result is undefined
 *
 * JsMockito.when(mockFunc).add(1, 2).thenReturn(6);
 * mockObj.add(1, 2); // result is 6
 *
 * JsMockito.verify(mockObj).add(1, greaterThan(2)); // ok
 * JsMockito.verify(mockObj).add(1, equalTo(2)); // ok
 * JsMockito.verify(mockObj).add(1, 4); // will throw an exception
 * </pre>
 *
 * @param Obj {function} the constructor for the object to be mocked
 * @return {object} a mock object
 */
JsMockito.mock = function(Obj, deep, spy) {
  var delegate = {};
  if (typeof Obj != "function") {
    delegate = Obj;
    Obj = function() { };
    Obj.prototype = delegate; 
    Obj.prototype.constructor = Obj;
  }
  var MockObject = function() { };
  MockObject.prototype = new Obj;
  MockObject.prototype.constructor = MockObject;

  var mockObject = new MockObject();
  var stubBuilders = {};
  var verifiers = {};
  var mockFunctions = [];

  var contextMatcher = JsHamcrest.Matchers.sameAs(mockObject);

  var addMockMethod = function(name) {
    var delegateMethod;
    if (delegate[name] != undefined) {
      delegateMethod = function() {
        var context = (this == mockObject)? delegate : this;
        if(spy) return delegate[name].apply(context, arguments);
      };
    }
    var mockFunc = JsMockito.mockFunction('obj.' + name, delegateMethod);
    mockObject[name] = mockFunc;
    stubBuilders[name] = mockFunc._jsMockitoStubBuilder;
    verifiers[name] = mockFunc._jsMockitoVerifier;
    mockFunctions.push(mockFunc);
  };

  for (var propertyName in mockObject) {
    if(typeof(mockObject[propertyName]) == "function") {
      if (propertyName != 'constructor')
        addMockMethod(propertyName);
    } else if(deep) {
      mockObject[propertyName] = mock(mockObject[propertyName], deep);
    }
  }

  for (var typeName in JsMockito.nativeTypes) {
    if (mockObject instanceof JsMockito.nativeTypes[typeName].type) {
      JsMockito.each(JsMockito.nativeTypes[typeName].methods, function(method) {
        addMockMethod(method);
      });
    }
  }

  mockObject._jsMockitoStubBuilder = function() {
    return JsMockito.mapInto(new MockObject(), stubBuilders, function(method) {
      return method.call(this, contextMatcher);
    });
  };

  mockObject._jsMockitoVerifier = function(verifier) {
    return JsMockito.mapInto(new MockObject(), verifiers, function(method) {
      return method.call(this, verifier, contextMatcher);
    });
  };

  mockObject._jsMockitoMockFunctions = function() {
    return mockFunctions;
  };

  return mockObject;
};
JsMockito._export.push('mock');
