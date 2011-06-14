// vi:ts=2 sw=2 expandtab

/**
 * Verifiers
 * @namespace
 */
JsMockito.Verifiers = {
  _export: ['never', 'zeroInteractions', 'noMoreInteractions', 'times', 'once', 'sequence'],

  /**
   * Test that a invocation never occurred. For example:
   * <pre>
   * verify(mock, never()).method();
   * </pre>
   * @see JsMockito.Verifiers.times(0)
   */
  never: function() {
    return new JsMockito.Verifiers.Times(0);
  },

  /** Test that no interaction were made on the mock.  For example:
   * <pre>
   * verify(mock, zeroInteractions());
   * </pre>
   * @see JsMockito.verifyZeroInteractions()
   */
  zeroInteractions: function() {
    return new JsMockito.Verifiers.ZeroInteractions();
  },

  /** Test that no further interactions remain unverified on the mock.  For
   * example:
   * <pre>
   * verify(mock, noMoreInteractions());
   * </pre>
   * @see JsMockito.verifyNoMoreInteractions()
   */
  noMoreInteractions: function() {
    return new JsMockito.Verifiers.NoMoreInteractions();
  },

  /**
   * Test that an invocation occurred a specific number of times. For example:
   * <pre>
   * verify(mock, times(2)).method();
   * </pre>
   *
   * @param wanted The number of desired invocations
   */
  times: function(wanted) { 
    return new JsMockito.Verifiers.Times(wanted);
  },

  /**
   * Test that an invocation occurred exactly once. For example:
   * <pre>
   * verify(mock, once()).method();
   * </pre>
   * This is the default verifier.
   * @see JsMockito.Verifiers.times(1)
   */
  once: function() { 
    return new JsMockito.Verifiers.Times(1);
  },

  /**
   * Create an instance of a sequence. The sequence is used to create
   * an in-sequence verifier that asserts that at least a number of
   * invocations occurred at a particular point in a sequence.
   * <pre>
   * var seq = sequence();
   * verify(mock1, seq(1)).method1(); // mock1#method1 must be called at least once
   * verify(mock2, seq(1)).method2(); // before mock2#method2 ... etc.
   * </pre>
   */
  sequence: function() {
    var sequenceVerifierState = {
      latestConsumedInteraction: {
        invocationOrderId: 0,
        args: [],
        func: {
          funcName: undefined
        }
      }
    };
    return function(count) {
      return new JsMockito.Verifiers.Sequence(sequenceVerifierState, count);
    };
  }
};

JsMockito.Verifier = function() { this.init.apply(this, arguments) };
JsMockito.Verifier.prototype = {
  init: function() { },

  verify: function(mock) {
    var self = this;
    return mock._jsMockitoVerifier(function() {
      self.verifyInteractions.apply(self, arguments);
    });
  },

  verifyInteractions: function(funcName, interactions, matchers, describeContext) {
  },

  updateVerifiedInteractions: function(interactions) {
    JsMockito.each(interactions, function(interaction) {
      interaction.verified = true;
    });
  },

  buildDescription: function(message, funcName, matchers, describeContext) {
    var description = new JsHamcrest.Description();
    description.append(message + ': ' + funcName + '(');
    JsMockito.each(matchers.slice(1), function(matcher, i) {
      if (i > 0)
        description.append(', ');
      description.append('<');
      matcher.describeTo(description);
      description.append('>');
    });
    description.append(")");
    if (describeContext) {
      description.append(", 'this' being ");
      matchers[0].describeTo(description);
    }
    return description;
  }
};

JsMockito.verifier('Times', {
  init: function(wanted) {
    this.wanted = wanted;
  },

  verifyInteractions: function(funcName, allInteractions, matchers, describeContext) {
    var interactions = JsMockito.grep(allInteractions, function(interaction) {
      return JsMockito.matchArray(matchers, interaction.args);
    });
    if (interactions.length == this.wanted) {
      this.updateVerifiedInteractions(interactions);
      return;
    }

    var message;
    if (interactions.length == 0) {
      message = 'Wanted but not invoked';
    } else if (this.wanted == 0) {
      message = 'Never wanted but invoked';
    } else if (this.wanted == 1) {
      message = 'Wanted 1 invocation but got ' + interactions.length;
    } else {
      message = 'Wanted ' + this.wanted + ' invocations but got ' + interactions.length;
    }

    var description = this.buildDescription(message, funcName, matchers, describeContext);
    throw description.get();
  }
});

JsMockito.verifier('ZeroInteractions', {
  verify: function(mock) {
    var neverVerifier = JsMockito.Verifiers.never();
    JsMockito.each(mock._jsMockitoMockFunctions(), function(mockFunc) {
      neverVerifier.verify(mockFunc)();
    });
  }
});

JsMockito.verifier('NoMoreInteractions', {
  verify: function(mock) {
    var self = this;
    JsMockito.each(mock._jsMockitoMockFunctions(), function(mockFunc) {
      JsMockito.Verifier.prototype.verify.call(self, mockFunc)();
    });
  },

  verifyInteractions: function(funcName, allInteractions, matchers, describeContext) {
    var interactions = JsMockito.grep(allInteractions, function(interaction) {
      return interaction.verified != true;
    });
    if (interactions.length == 0)
      return;
    
    var description = this.buildDescription(
      "No interactions wanted, but " + interactions.length + " remains",
      funcName, matchers, describeContext);
    throw description.get();
  }
});

// This verifier works as follows:
// 1. All interactions (with any mock) are given an `invocation order id'
// during interaction harvesting.
// 2. Sequence#verifyInteractions asserts that the invocation order id of
// the newly matched interaction is higher than the previous one.
// 3. If so, update pointer to latest consume interaction (set it to the
// newly matched interaction). Else throw sensible exception.
JsMockito.verifier('Sequence', {
  init: function(sequenceVerifierState, count) {
    this.sequenceVerifierState = sequenceVerifierState;
    if(count > 0) {
      this.count = count;
    } else {
      throw "The sequence verifier cannot verify sequences of length 0";
    }
  },

  verifyInteractions: function(funcName, allInteractions, matchers, describeContext) {
    var verifier = this;

    var interactions = JsMockito.grep(allInteractions, function(interaction) {
      return JsMockito.matchArray(matchers, interaction.args);
    });

    var latestConsumedInteraction = verifier.sequenceVerifierState.latestConsumedInteraction;
    var index = JsMockito.indexOf(interactions,function(interaction) {
      return interaction.invocationOrderId > latestConsumedInteraction.invocationOrderId;
    });

    var newLatestConsumedInteraction = interactions[index+verifier.count-1];

    (function assertNewLatestConsumedInteractionIsValid() {
      var message = undefined,
          latestConsumedInteractionFuncName = latestConsumedInteraction.func.funcName;
      if(interactions.length == 0) {
        message = "Expected but never invoked";
      } else if (index == undefined) {
        message = "Expected to be invoked at least " + verifier.count +
                  " times after invoking " + latestConsumedInteractionFuncName + "()";
      } else if ( newLatestConsumedInteraction == undefined ) {
        if (latestConsumedInteraction.invocationOrderId == 0) {
          message = "Expected to be invoked at least " + verifier.count +
                    " times but got " + (interactions.length - index);
        } else {
          message = "Expected to be invoked at least " + verifier.count +
                    " times after invoking " + latestConsumedInteractionFuncName + "()"
                    " but got " + (interactions.length - index);
        }
      }

      if ( message != undefined ) {
        var description = verifier.buildDescription(message, funcName, matchers, describeContext);
        throw description.get();
      }
    })();

    // Caveat Lector: DO NOT REPLACE BY: "latestConsumedInteraction = interactions[...]",
    // as it will not update the sequenceVerifierState!
    this.sequenceVerifierState.latestConsumedInteraction = newLatestConsumedInteraction;
  }
});
