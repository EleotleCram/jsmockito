// vi:ts=2 sw=2 expandtab
Screw.Unit(function() {
  describe('JsMockito verifiers', function() {

    describe('#never', function() {
      describe('when verifing mock functions', function() {
        var mockFunc;
        before(function() {
          mockFunc = mockFunction();
        });

        describe('when function never invoked', function() {
          it('should verify with no arguments', function() {
            verify(mockFunc, never())();
          });
          it('should verify with arguments', function() {
            verify(mockFunc, never())(42, 'hi');
          });
        });

        describe('when function invoked', function() {
          before(function() {
            mockFunc(42, 'hi');
          });
          it('should verify with different arguments', function() {
            verify(mockFunc, never())('foo');
          });
          it('should not verify with no arguments', function() {
            assertThat(function() {
              verify(mockFunc, never())();
            }, throwsMessage("Never wanted but invoked: func()"));
          });
          it('should not verify with same arguments', function() {
            assertThat(function() {
              verify(mockFunc, never())(42, 'hi');
            }, throwsMessage('Never wanted but invoked: func(<equal to 42>, <equal to "hi">)'));
          });
        });
      });

      describe('when verifing mock object methods', function() {
        var mockObj;
        before(function() {
          mockObj = mock(MyObject);
        });

        describe('when method never invoked', function() {
          it('should verify with no arguments', function() {
            verify(mockObj, never()).greeting();
          });
          it('should verify with arguments', function() {
            verify(mockObj, never()).greeting(42, 'hi');
          });
        });

        describe('when method invoked', function() {
          before(function() {
            mockObj.greeting(42, 'hi');
          });
          it('should verify with different arguments', function() {
            verify(mockObj, never()).greeting('foo');
          });
          it('should not verify with no arguments', function() {
            assertThat(function() {
              verify(mockObj, never()).greeting();
            }, throwsMessage("Never wanted but invoked: obj.greeting()"));
          });
          it('should not verify with same arguments', function() {
            assertThat(function() {
              verify(mockObj, never()).greeting(42, 'hi');
            }, throwsMessage('Never wanted but invoked: obj.greeting(<equal to 42>, <equal to "hi">)'));
          });
        });
      });
    });

    describe('#zeroInteractions', function() {
      describe('when verifing mock functions', function() {
        var mockFunc;
        before(function() {
          mockFunc = mockFunction();
        });

        describe('when function never invoked', function() {
          it('should verify', function() {
            verify(mockFunc, zeroInteractions());
          });
        });

        describe('when function invoked', function() {
          before(function() {
            mockFunc(42, 'hi');
          });
          it('should not verify', function() {
            assertThat(function() {
              verify(mockFunc, zeroInteractions());
            }, throwsMessage("Never wanted but invoked: func()"));
          });
        });
      });

      describe('when verifing mock object methods', function() {
        var mockObj;
        before(function() {
          mockObj = mock(MyObject);
        });

        describe('when methods never invoked', function() {
          it('should verify', function() {
            verify(mockObj, zeroInteractions());
          });
        });

        describe('when methods invoked', function() {
          before(function() {
            mockObj.greeting(42, 'hi');
          });
          it('should not verify', function() {
            assertThat(function() {
              verify(mockObj, zeroInteractions());
            }, throwsMessage("Never wanted but invoked: obj.greeting()"));
          });
        });
      });
    });

    describe('#noMoreInteractions', function() {
      describe('when verifing mock functions', function() {
        var mockFunc;
        before(function() {
          mockFunc = mockFunction();
        });

        describe('when function never invoked', function() {
          it('should verify', function() {
            verify(mockFunc, noMoreInteractions());
          });
        });

        describe('when all interactions have been verified', function() {
          before(function() {
            mockFunc(42, 'hi');
            mockFunc(31, 'bye');
            verify(mockFunc, times(2))(anything(), anything());
          });
          it('should verify', function() {
            verify(mockFunc, noMoreInteractions());
          });
        });

        describe('when interactions remain unverified', function() {
          before(function() {
            mockFunc(42, 'hi');
            mockFunc(31, 'bye');
            verify(mockFunc)(31, 'bye');
          });
          it('should not verify', function() {
            assertThat(function() {
              verify(mockFunc, noMoreInteractions());
            }, throwsMessage("No interactions wanted, but 1 remains: func()"));
          });
        });
      });

      describe('when verifing mock object methods', function() {
        var mockObj;
        before(function() {
          mockObj = mock(MyObject);
        });

        describe('when methods never invoked', function() {
          it('should verify', function() {
            verify(mockObj, noMoreInteractions());
          });
        });

        describe('when all interactions have been verified', function() {
          before(function() {
            mockObj.greeting(42, 'hi');
            mockObj.farewell(31, 'bye');
            verify(mockObj).greeting(anything(), anything());
            verify(mockObj).farewell(anything(), anything());
          });
          it('should verify', function() {
            verify(mockObj, noMoreInteractions());
          });
        });

        describe('when interactions remain unverified', function() {
          before(function() {
            mockObj.greeting(42, 'hi');
            mockObj.farewell(31, 'bye');
            verify(mockObj).greeting(anything(), anything());
          });
          it('should not verify', function() {
            assertThat(function() {
              verify(mockObj, noMoreInteractions());
            }, throwsMessage("No interactions wanted, but 1 remains: obj.farewell()"));
          });
        });
      });
    });

    describe('#once', function() {
      describe('when verifing mock functions', function() {
        var mockFunc;
        before(function() {
          mockFunc = mockFunction();
        });

        describe('when function never invoked', function() {
          it('should not verify', function() {
            assertThat(function() {
              verify(mockFunc, once())();
            }, throwsMessage('Wanted but not invoked: func()'));
          });
        });

        describe('when function invoked once', function() {
          before(function() {
            mockFunc(42, 'hi');
          });
          it('should not verify with different arguments', function() {
            assertThat(function() {
              verify(mockFunc, once())('foo');
            }, throwsMessage('Wanted but not invoked: func(<equal to "foo">)'));
          });
          it('should verify with no arguments', function() {
            verify(mockFunc, once())();
          });
          it('should verify with same arguments', function() {
            verify(mockFunc, once())(42, 'hi');
          });
        });

        describe('when function invoked 3 times with different args', function() {
          before(function() {
            mockFunc(42, 'hi');
            mockFunc(43, 'hi');
            mockFunc(42, 'bye');
          });
          it('should not verify with no arguments', function() {
            assertThat(function() {
              verify(mockFunc, once())();
            }, throwsMessage('Wanted 1 invocation but got 3: func()'));
          });
          it('should not verify with some arguments', function() {
            assertThat(function() {
              verify(mockFunc, once())(42);
            }, throwsMessage('Wanted 1 invocation but got 2: func(<equal to 42>)'));
          });
          it('should verify with all arguments', function() {
            verify(mockFunc, once())(42, 'hi');
          });
        });
      });

      describe('when verifing mock object methods', function() {
        var mockObj;
        before(function() {
          mockObj = mock(MyObject);
        });

        describe('when methods never invoked', function() {
          it('should not verify', function() {
            assertThat(function() {
              verify(mockObj, once()).greeting();
            }, throwsMessage('Wanted but not invoked: obj.greeting()'));
          });
        });

        describe('when method invoked once', function() {
          before(function() {
            mockObj.greeting(42, 'hi');
          });
          it('should not verify with different arguments', function() {
            assertThat(function() {
              verify(mockObj, once()).greeting('foo');
            }, throwsMessage('Wanted but not invoked: obj.greeting(<equal to "foo">)'));
          });
          it('should verify with no arguments', function() {
            verify(mockObj, once()).greeting();
          });
          it('should verify with same arguments', function() {
            verify(mockObj, once()).greeting(42, 'hi');
          });
        });

        describe('when method invoked 3 times with different args', function() {
          before(function() {
            mockObj.greeting(42, 'hi');
            mockObj.greeting(43, 'hi');
            mockObj.greeting(42, 'bye');
          });
          it('should not verify with no arguments', function() {
            assertThat(function() {
              verify(mockObj, once()).greeting();
            }, throwsMessage('Wanted 1 invocation but got 3: obj.greeting()'));
          });
          it('should not verify with some arguments', function() {
            assertThat(function() {
              verify(mockObj, once()).greeting(42);
            }, throwsMessage('Wanted 1 invocation but got 2: obj.greeting(<equal to 42>)'));
          });
          it('should verify with all arguments', function() {
            verify(mockObj, once()).greeting(42, 'hi');
          });
        });
      });
    });

    describe('#times', function() {
      describe('when verifing mock functions', function() {
        var mockFunc;
        before(function() {
          mockFunc = mockFunction();
        });

        describe('when function never invoked', function() {
          it('should verify invoked 0 times', function() {
            verify(mockFunc, times(0))();
          });
          it('should not verify invoked 1 time', function() {
            assertThat(function() {
              verify(mockFunc, times(1))();
            }, throwsMessage('Wanted but not invoked: func()'));
          });
        });

        describe('when function invoked once', function() {
          before(function() {
            mockFunc(42, 'hi');
          });
          it('should not verify invoked 0 times with no arguments', function() {
            assertThat(function() {
              verify(mockFunc, times(0))();
            }, throwsMessage('Never wanted but invoked: func()'));
          });
          it('should verify invoked 0 times with different arguments', function() {
            verify(mockFunc, times(0))('foo');
          });
          it('should not verify invoked 0 times with same arguments', function() {
            assertThat(function() {
              verify(mockFunc, times(0))(42, 'hi');
            }, throwsMessage('Never wanted but invoked: func(<equal to 42>, <equal to "hi">)'));
          });

          it('should verify invoked 1 time with no arguments', function() {
            verify(mockFunc, times(1))();
          });
          it('should not verify invoked 1 time with different arguments', function() {
            assertThat(function() {
              verify(mockFunc, times(1))('foo');
            }, throwsMessage('Wanted but not invoked: func(<equal to "foo">)'));
          });
          it('should verify invoked 1 time with same arguments', function() {
            verify(mockFunc, times(1))(42, 'hi');
          });

          it('should not verify invoked 2 times with no arguments', function() {
            assertThat(function() {
              verify(mockFunc, times(2))();
            }, throwsMessage('Wanted 2 invocations but got 1: func()'));
          });
          it('should not verify invoked 2 times with different arguments', function() {
            assertThat(function() {
              verify(mockFunc, times(2))('foo');
            }, throwsMessage('Wanted but not invoked: func(<equal to "foo">)'));
          });
          it('should not verify invoked 2 times with same arguments', function() {
            assertThat(function() {
              verify(mockFunc, times(2))(42, 'hi');
            }, throwsMessage('Wanted 2 invocations but got 1: func(<equal to 42>, <equal to "hi">)'));
          });
        });

        describe('when function invoked 3 times with different args', function() {
          before(function() {
            mockFunc(42, 'hi');
            mockFunc(43, 'hi');
            mockFunc(42, 'bye');
          });
          it('should not verify invoked 1 time with no arguments', function() {
            assertThat(function() {
              verify(mockFunc, times(1))();
            }, throwsMessage('Wanted 1 invocation but got 3: func()'));
          });
          it('should not verify invoked 2 times with no arguments', function() {
            assertThat(function() {
              verify(mockFunc, times(2))();
            }, throwsMessage('Wanted 2 invocations but got 3: func()'));
          });
          it('should verify invoked 3 times with no arguments', function() {
            verify(mockFunc, times(3))();
          });

          it('should not verify invoked 1 time with some arguments', function() {
            assertThat(function() {
              verify(mockFunc, times(1))(42);
            }, throwsMessage('Wanted 1 invocation but got 2: func(<equal to 42>)'));
          });
          it('should verify invoked 2 times with some arguments', function() {
            verify(mockFunc, times(2))(42);
          });
          it('should not verify invoked 3 times with some arguments', function() {
            assertThat(function() {
              verify(mockFunc, times(3))(42);
            }, throwsMessage('Wanted 3 invocations but got 2: func(<equal to 42>)'));
          });

          it('should verify invoked 1 time with all arguments', function() {
            verify(mockFunc, times(1))(42, 'hi');
          });
          it('should not verify invoked 2 times with all arguments', function() {
            assertThat(function() {
              verify(mockFunc, times(2))(42, 'hi');
            }, throwsMessage('Wanted 2 invocations but got 1: func(<equal to 42>, <equal to "hi">)'));
          });
        });
      });

      describe('when verifing mock object methods', function() {
        var mockObj;
        before(function() {
          mockObj = mock(MyObject);
        });

        describe('when method never invoked', function() {
          it('should verify invoked 0 times', function() {
            verify(mockObj, times(0)).greeting();
          });
          it('should not verify invoked 1 time', function() {
            assertThat(function() {
              verify(mockObj, times(1)).greeting();
            }, throwsMessage('Wanted but not invoked: obj.greeting()'));
          });
        });

        describe('when method invoked once', function() {
          before(function() {
            mockObj.greeting(42, 'hi');
          });
          it('should not verify invoked 0 times with no arguments', function() {
            assertThat(function() {
              verify(mockObj, times(0)).greeting();
            }, throwsMessage('Never wanted but invoked: obj.greeting()'));
          });
          it('should verify invoked 0 times with different arguments', function() {
            verify(mockObj, times(0)).greeting('foo');
          });
          it('should not verify invoked 0 times with same arguments', function() {
            assertThat(function() {
              verify(mockObj, times(0)).greeting(42, 'hi');
            }, throwsMessage('Never wanted but invoked: obj.greeting(<equal to 42>, <equal to "hi">)'));
          });

          it('should verify invoked 1 time with no arguments', function() {
            verify(mockObj, times(1)).greeting();
          });
          it('should not verify invoked 1 time with different arguments', function() {
            assertThat(function() {
              verify(mockObj, times(1)).greeting('foo');
            }, throwsMessage('Wanted but not invoked: obj.greeting(<equal to "foo">)'));
          });
          it('should verify invoked 1 time with same arguments', function() {
            verify(mockObj, times(1)).greeting(42, 'hi');
          });

          it('should not verify invoked 2 times with no arguments', function() {
            assertThat(function() {
              verify(mockObj, times(2)).greeting();
            }, throwsMessage('Wanted 2 invocations but got 1: obj.greeting()'));
          });
          it('should not verify invoked 2 times with different arguments', function() {
            assertThat(function() {
              verify(mockObj, times(2)).greeting('foo');
            }, throwsMessage('Wanted but not invoked: obj.greeting(<equal to "foo">)'));
          });
          it('should not verify invoked 2 times with same arguments', function() {
            assertThat(function() {
              verify(mockObj, times(2)).greeting(42, 'hi');
            }, throwsMessage('Wanted 2 invocations but got 1: obj.greeting(<equal to 42>, <equal to "hi">)'));
          });
        });

        describe('when function invoked 3 times with different args', function() {
          before(function() {
            mockObj.greeting(42, 'hi');
            mockObj.greeting(43, 'hi');
            mockObj.greeting(42, 'bye');
          });
          it('should not verify invoked 1 time with no arguments', function() {
            assertThat(function() {
              verify(mockObj, times(1)).greeting();
            }, throwsMessage('Wanted 1 invocation but got 3: obj.greeting()'));
          });
          it('should not verify invoked 2 times with no arguments', function() {
            assertThat(function() {
              verify(mockObj, times(2)).greeting();
            }, throwsMessage('Wanted 2 invocations but got 3: obj.greeting()'));
          });
          it('should verify invoked 3 times with no arguments', function() {
            verify(mockObj, times(3)).greeting();
          });

          it('should not verify invoked 1 time with some arguments', function() {
            assertThat(function() {
              verify(mockObj, times(1)).greeting(42);
            }, throwsMessage('Wanted 1 invocation but got 2: obj.greeting(<equal to 42>)'));
          });
          it('should verify invoked 2 times with some arguments', function() {
            verify(mockObj, times(2)).greeting(42);
          });
          it('should not verify invoked 3 times with some arguments', function() {
            assertThat(function() {
              verify(mockObj, times(3)).greeting(42);
            }, throwsMessage('Wanted 3 invocations but got 2: obj.greeting(<equal to 42>)'));
          });

          it('should verify invoked 1 time with all arguments', function() {
            verify(mockObj, times(1)).greeting(42, 'hi');
          });
          it('should not verify invoked 2 times with all arguments', function() {
            assertThat(function() {
              verify(mockObj, times(2)).greeting(42, 'hi');
            }, throwsMessage('Wanted 2 invocations but got 1: obj.greeting(<equal to 42>, <equal to "hi">)'));
          });
        });
      });
    });

    describe('#sequence', function() {
      var mock1, mock2, seq;

      before(function() {
        mock1 = mock({a: function(){},b: function(){},c: function(){}});
        mock2 = mock({d: function(){},e: function(){},f: function(){}});
        seq = sequence();
      });

      describe("invocation order a,a,b,a", function() {
        before(function() {
          mock1.a(); mock1.a(); mock1.b(); mock1.a();
        });

        it("should pass when checking for a,a,a", function() {
          verify(mock1, seq(1)).a();
          verify(mock1, seq(1)).a();
          verify(mock1, seq(1)).a();
        });

        it("should pass when checking for a followed by a,a", function() {
          verify(mock1, seq(1)).a();
          verify(mock1, seq(2)).a();
        });

        it("should pass when checking for a,a,b,a", function() {
          verify(mock1, seq(2)).a();
          verify(mock1, seq(1)).b();
          verify(mock1, seq(1)).a();
        });

        it("should pass when checking for b,a", function() {
          verify(mock1, seq(1)).b();
          verify(mock1, seq(1)).a();
        });

        it("should fail when checking for c", function() {
          assertThat(function() {
            verify(mock1, seq(1)).c();
          }, raises());
        });

        it("should fail when checking for b,a,a", function() {
          verify(mock1, seq(1)).b();
          assertThat(function() {
            verify(mock1, seq(2)).a();
          }, raises());
        });
      });

      describe("invocation order a,d,a,b,a", function() {
        before(function() {
          mock1.a(); mock2.d(); mock1.a(); mock1.b(); mock1.a();
        });

        it("should pass when checking for a,d,b", function() {
          verify(mock1, seq(1)).a();
          verify(mock2, seq(1)).d();
          verify(mock1, seq(1)).b();
        });
      });

      describe("invocation order a(1),a(2)", function() {
        before(function() {
          mock1.a(1); mock1.a(2);
        });

        it("should pass when checking for a(1),a(2)", function() {
          verify(mock1, seq(1)).a(1);
          verify(mock1, seq(1)).a(2);
        });

        it("should fail when checking for a(2),a(1)", function() {
          verify(mock1, seq(1)).a(2);
          assertThat(function() {
            verify(mock1, seq(1)).a(1);
          }, raises());
        });

        it("should fail when checking for a(1),a(1)", function() {
          verify(mock1, seq(1)).a(1);
          assertThat(function() {
            verify(mock1, seq(1)).a(1);
          }, raises());
        });

        it("should fail when checking for a(1),a(1)", function() {
          assertThat(function() {
            verify(mock1, seq(2)).a(1);
          }, raises());
        });

        it("should fail when checking for a(3)", function() {
          assertThat(function() {
            verify(mock1, seq(1)).a(3);
          }, raises());
        });
      });

      describe("when testing for all possible verification errors", function() {
        before(function() {
          mock1.b(); mock1.a();
        });

        it("should fail when checking with 0 argument", function() {
          assertThat(function() {
            verify(mock1, seq(0)).a();
          }, throwsMessage("The sequence verifier cannot verify sequences of length 0"));
        });

        it("should fail when checking for c", function() {
          assertThat(function() {
            verify(mock1, seq(1)).c();
          }, throwsMessage("Expected but never invoked: obj.c()"));
        });

        it("should fail when checking for a,b", function() {
          verify(mock1, seq(1)).a();
          assertThat(function() {
            verify(mock1, seq(1)).b();
          }, throwsMessage("Expected to be invoked at least 1 times after invoking obj.a(): obj.b()"));
        });

        it("should fail when checking for a,a", function() {
          assertThat(function() {
            verify(mock1, seq(2)).a();
          }, throwsMessage("Expected to be invoked at least 2 times but got 1: obj.a()"));
        });

        it("should fail when checking for b,a,a", function() {
          verify(mock1, seq(1)).b();
          assertThat(function() {
            verify(mock1, seq(2)).a();
          }, throwsMessage("Expected to be invoked at least 2 times after invoking obj.b(): obj.a()"));
        });

      });

      after(function() {});

    });
  });
});
