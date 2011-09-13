// vi:ts=2 sw=2 expandtab

/**
 * Verifiers
 * @namespace
 */
JsMockito.Verifiers = {
  _export: ['never', 'zeroInteractions', 'noMoreInteractions', 'times', 'once'],

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
    description.append(message + ': ');
    this.describeFunctionTo(funcName, matchers, description, function describeTo(description) {
      description.append('<');
      this.describeTo(description);
      description.append('>');
    });
    if (describeContext) {
      description.append(", 'this' being ");
      matchers[0].describeTo(description);
    }
    return description;
  },

  describeFunctionTo: function(funcName, matchers, description, describeFunction) {
    // slice(1) to cut off the 'this' context.
    var argumentMatchers = matchers.slice(1);
    var hasMoreThanOneArgument = argumentMatchers.length > 1;

    if (hasMoreThanOneArgument) {
      description.append("\n\n");
    }

    description.append(funcName + '(');

    if (hasMoreThanOneArgument) {
      description.append("\n\t");
    }

    JsMockito.each(argumentMatchers, function(matcher, i) {
      if (i > 0) {
        description.append(', ');
        description.append("\n\t");
      }

      describeFunction.call(matcher, description, i+1); // +1 to counteract the slice(1)
    });

    if (hasMoreThanOneArgument) {
      description.append("\n)");
    }
  },

  describeInteractionsTo: function(interactions, funcName, matchers, description) {
    description.append("\n\nInteractions are:");

    var verifier = this;
    interactions.forEach(function(interaction) {
      verifier.describeFunctionTo(funcName, matchers, description, function describeValueTo(description, argIndex) {
        var valueDescription = new JsHamcrest.Description();
        var value = interaction.args[argIndex];
        var matched = this.matches(value); // CAVEAT: This must be done before describeValueTo, because some matchers
                                           //            may produce a different message after a test (holding match info)
        this.describeValueTo(value, valueDescription);

        if(!/\x02/.test(valueDescription.get()) && !matched) {
          description.append('\x02');
          description.append(valueDescription.get());
          description.append('\x02');
        } else {
          description.append(valueDescription.get());
        }
      });
    });
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
    this.describeInteractionsTo(allInteractions, funcName, matchers, description);
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
    this.describeInteractionsTo(allInteractions, funcName, matchers, description);
    throw description.get();
  }
});
