import WidgetProperty from 'ember-eureka/widget-property';

export default WidgetProperty.extend({

    editing: false,

    toggleEditionMode: function() {
        this.toggleProperty('field.editing', true);
    },

    actions: {
        edit: function() {
            this.toggleEditionMode();
        },
        addRelation: function() {
            var field = this.get('field');
            var db = field.get('meta.modelMeta.store.db');
            var relationType = field.get('meta.type');
            var relation = db[relationType].createRecord();
            field.set('value', relation);
            this.toggleEditionMode();
        },
        deleteRelation: function() {
            this.set('field.value', null);
        },
        doneRelation: function() {
            var field = this.get('field');
            var relation;

            if (field.get('value.promise') !== undefined) {
                relation = field.get('value.content');  // it's a proxy-promise
            } else {
                relation = field.get('value');
            }

            if (relation.get('_syncNeeded')) {
                var that = this;
                relation.save().then(function(savedRelation) {
                    field.set('value', savedRelation);
                    that.toggleEditionMode();
                });
            } else {
                if (!relation.get('_id')) {
                    field.set('value', null);
                }
                this.toggleEditionMode();
            }
        },
        cancelRelation: function() {
            var field = this.get('field');
            if (field.get('value.promise') !== undefined) {
                this.get('field.value.content').rollback(); // it's a proxy-promise
            } else {
                this.get('field.value').rollback();
            }
            this.toggleEditionMode();
        }
    }

});
