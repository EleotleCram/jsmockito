// vi:ts=2 sw=2 expandtab
Screw.Unit(function() {
  describe('JsMockito object mocking', function() {

    describe("when mock object created", function() {
      var mockObj;
      before(function() {
		mockObj = mock(MyObject);
      });

      it("should be an instance of the same class", function() {
        assertThat(mockObj, instanceOf(MyObject));
      });

      it("should provide an instance of the same class when stubbing", function() {
        var stubBuilder = when(mockObj);
        assertThat(stubBuilder, instanceOf(MyObject));
      });

      it("should provide an instance of the same class when verifing", function() {
        var verifier = verify(mockObj);
        assertThat(verifier, instanceOf(MyObject));
      });

      it("should verify that mock object had zero interactions", function() {
        verifyZeroInteractions(mockObj);
      });
    });

    describe("when mock method invoked once with no arguments", function() { 
      var mockObj;
      var proxyMock;
      var result;
      before(function() {
		mockObj = mock(MyObject);
        proxyMock = mock(mockObj);
        result = proxyMock.greeting();
      });

      it("should return undefined", function() {
        assertThat(result, sameAs(undefined));
      });

      it("should not invoke method on proxied object", function() {
		verify(mockObj, never()).greeting();
      });

      it("should verify method was invoked", function() {
        verify(proxyMock).greeting();
      });

      it("should verify method was invoked with context", function() {
        verify(proxyMock).greeting.call(proxyMock);
      });

      it("should verify method was invocked using context matcher", function() {
        verify(proxyMock).greeting.apply(anything(), []);
      });

      it("should not verify method was invoked with different context", function() {
        var testContext = {};
        assertThat(function() {
          verify(proxyMock).greeting.call(testContext);
        }, throwsMessage(
          "Wanted but not invoked: obj.greeting(), 'this' being equal to " + testContext)
        );
      });

      it("should verify that method was not invoked twice", function() {
        assertThat(function() {
          verify(proxyMock, times(2)).greeting();
        }, throwsMessage("Wanted 2 invocations but got 1: obj.greeting()"));
      });

      it("should not verify that the mock object had zero interactions", function() {
        assertThat(function() {
          verifyZeroInteractions(proxyMock);
        }, throwsMessage("Never wanted but invoked: obj.greeting()"));
      });

      it("should not verify that the mock object had no more interactions", function() {
        assertThat(function() {
          verifyNoMoreInteractions(proxyMock);
        }, throwsMessage("No interactions wanted, but 1 remains: obj.greeting()"));
      });

      describe("when verified", function() {
        before(function() {
          verify(proxyMock).greeting();
        });

        it("should verify that mock object had no more interactions", function() {
          verifyNoMoreInteractions(proxyMock);
        });
      });
    });

    describe("when mock method invocked with multiple arguments", function() {
      var mockObj;
      var proxyMock;
      before(function() {
		mockObj = mock(MyObject);
        proxyMock = mock(mockObj);
        proxyMock.farewell('hunter', 'thompson', 67);
      });

      it("should not invoke method on proxied object", function() {
		verify(mockObj, never()).farewell();
      });

      it("should verify the method was invoked", function() {
        verify(proxyMock).farewell();
      });

      it("should verify the method was invoked with some arguments", function() {
        verify(proxyMock).farewell('hunter', 'thompson');
      });

      it("should verify the method was invoked with all arguments", function() {
        verify(proxyMock).farewell('hunter', 'thompson', 67);
      });

      it("should verify the method was invoked using matchers", function() {
        verify(proxyMock).farewell('hunter', 'thompson', lessThan(100));
      });

      it("should not verify the method was invoked if looking for additional arguments", function() {
        assertThat(function() {
          verify(proxyMock).farewell('hunter', 'thompson', 67, 'batcountry');
        }, throwsMessage(
          "Wanted but not invoked: obj.farewell(<equal to \"hunter\">, <equal to \"thompson\">, <equal to 67>, <equal to \"batcountry\">)")
        );
      });

      it("should not verify the method was invoked if different arguments", function() {
        assertThat(function() {
          verify(proxyMock).farewell('hunter', 'thompson', 68);
        }, throwsMessage(
          "Wanted but not invoked: obj.farewell(<equal to \"hunter\">, <equal to \"thompson\">, <equal to 68>)")
        );
      });
    });

    describe("when mock method invocked with different context", function() {
      var mockObj;
      var proxyMock;
      var testContext = {};
      before(function() {
		mockObj = mock(MyObject);
        proxyMock = mock(mockObj);
        proxyMock.greeting.call(testContext);
      });

      it("should not invoke method on proxied object", function() {
		verify(mockObj, never()).greeting.apply(testContext, []);
      });

      it("should not verify that the method was invoked without explicit context", function() {
        assertThat(function() {
          verify(proxyMock).greeting();
        }, throwsMessage("Wanted but not invoked: obj.greeting()"));
      });

      it("should verify method was invoked with explicit context", function() {
        verify(proxyMock).greeting.apply(testContext, []);
      });
    });

    describe("when stubbing methods", function() {
      var mockObj;
      var proxyMock;
      before(function() {
		mockObj = mock(MyObject);
        proxyMock = mock(mockObj);
      });

      var stubContext;
      var stubArguments;
      function stubFunction() {
        stubContext = this;
        stubArguments = arguments;
        return 'stub result';
      }

      after(function() {
        stubContext = undefined;
        stubArguments = undefined;
      });

      describe("when method is stubbed with no arguments", function() {
        describe("when no clause applied", function() {
          before(function() {
            when(proxyMock).greeting();
          });

		  it("should not invoke method on proxied object", function() {
			verify(mockObj, never()).greeting();
		  });

          it("should return undefined", function() {
            assertThat(proxyMock.greeting(), sameAs(undefined));
          });
        });

        describe("when using 'then' and a function stub", function() {
          before(function() {
            when(proxyMock).greeting().then(stubFunction);
          });

		  it("should not invoke method on proxied object", function() {
			verify(mockObj, never()).greeting();
		  });

          it("should return result of stub function", function() {
            assertThat(proxyMock.greeting(), equalTo('stub result'));
          });

          it("should invoke stub function when called", function() {
            proxyMock.greeting();
            assertThat(stubArguments, not(nil()));
          });

          it("should invoke stub function with the mock as context by default", function() {
            proxyMock.greeting();
            assertThat(stubContext, sameAs(proxyMock), "Context was not the same");
          });

          it("should invoke stub function with the same arguments", function() {
            proxyMock.greeting('hello', undefined, 5);
            assertThat(stubArguments, equalTo(['hello', undefined, 5]));
          });

          it("should invoke stub function when invoked via call with object as context", function() {
            proxyMock.greeting.call(proxyMock);
            assertThat(stubContext, sameAs(proxyMock), "Context was not the same");
          });

          it("should invoke stub function when invoked via apply with object as context", function() {
            proxyMock.greeting.apply(proxyMock, ['hello', 6]);
            assertThat(stubContext, sameAs(proxyMock), "Context was not the same");
            assertThat(stubArguments, equalTo(['hello', 6]));
          });

          it("should not invoke stub function when invoked via call with different context", function() {
            assertThat(proxyMock.greeting.call({}), sameAs(undefined));
            assertThat(stubContext, sameAs(undefined));
          });
        });
      });

      describe("when method is stubbed with multiple arguments", function() {
        before(function() {
          when(proxyMock).farewell('foo', lessThan(10), anything()).then(stubFunction);
        });

        it("should not invoke method on proxied object", function() {
		  verify(mockObj, never()).farewell();
        });

        it("should return result of stub function", function() {
          assertThat(proxyMock.farewell('foo', 9, {}), equalTo('stub result'));
        });

        it("should invoke stub even if additional arguments are present", function() {
          assertThat(proxyMock.farewell.apply(proxyMock, ['foo', 9, {}, 'something else']), equalTo('stub result'));
        });

        it("should return undefined if insufficent arguments compared to stub", function() {
          assertThat(proxyMock.farewell('foo', 9), sameAs(undefined));
        });

        it("should return undefined if arguments do not match", function() {
          assertThat(proxyMock.farewell('foo', 11, 'bar'), sameAs(undefined));
        });
      });
    
      describe("when stubbing a method with explit context matcher and 'then' clause", function() {
        before(function() {
          when(proxyMock).greeting.call(anything()).then(stubFunction);
        });

        it("should not invoke method on proxied object", function() {
		  verify(mockObj, never()).greeting.call();
        });

        it("should invoke stub function with the same explicit context", function() {
          var context = {};
          proxyMock.greeting.call(context, 1, 'foo');
          assertThat(stubContext, sameAs(context), "Context was not the same");
        });
      });
    });
  });
});
