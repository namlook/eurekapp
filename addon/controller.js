import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['application'],

    applicationController: Ember.computed.alias('controllers.application'),
    currentRouteName: Ember.computed.alias('applicationController.currentRouteName'),


    queryParams: function() {
        var params = this.get('meta.queryParams');
        var that = this;
        if (params) {
            if (!Ember.isArray(params)) {
                console.error('at this moment, queryParams should be array');
            }
            // set the query
            params.forEach(function(param) {
                that.set(param, null);
            });
            return params;
        }
        return Ember.A();
    }.property('meta'),


    actions: {
        /** In order to pass action to the controller, wigdets and compontents
         * has to send their actions with `this.sendAction('toControllerAction', actionName)`
         * A payload can be passed to the controller like this:
         *
         *   this.sendAction('toControllerAction', {name: 'save', payload: model});
         */
        toControllerAction: function(action) {
            console.log('received action', action);
            if (action.name) {
                this.send(action.name, action.payload);
            } else {
                this.send(action);
            }
        }
    },

});
