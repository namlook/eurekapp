
import Ember from 'ember';
import FieldMeta from './field-meta';
import endsWith from './utils/ends-with';

/** return the field meta of a the full property.
 * The full property is passed as an array:
 *     my.full.property -> ['my', 'full', 'property']
 */
export var getFieldMeta = function(propertyNames, modelMeta) {
    var fieldMeta = modelMeta.get(propertyNames[0] + 'Field');
    propertyNames.shift();
    if (propertyNames.length) {
        let newModelMeta = fieldMeta.get('relationModelMeta');
        if (newModelMeta && newModelMeta.get(propertyNames[0] + 'Field')) {
            return getFieldMeta(propertyNames, newModelMeta);
        }
    }
    return fieldMeta;
};


export default Ember.ObjectProxy.extend({
    resource: null,
    store: null,
    // content: the resource structure in eureka's config

    fieldNames: Ember.computed('resource', function() {
        return Object.keys(this.get('properties'));
    }),

    relationFieldNames: Ember.computed('fieldNames', function() {
        var results = Ember.A();
        var that = this;
        this.get('fieldNames').forEach(function(fieldName) {
            if (that.get(`${fieldName}Field.isRelation`)) {
                results.pushObject(fieldName);
            }
        });
        return results;
    }),

    /** return the field meta of a the full property. **/
    getFieldMeta: function(fullProperty) {
        if (fullProperty) {
            return getFieldMeta(fullProperty.split('.'), this);
        }
    },

    unknownProperty: function(key) {
        /*
         * If a property name ends with 'Field', then the ModelField
         * object is returned. This is useful if we're looking for the
         * field informations like schema or model relations.
         */
        if (endsWith(key, 'Field')){
            var fieldName = key.slice(0, key.length - 'Field'.length);
            if (this.get(`properties.${fieldName}`)) {
                return FieldMeta.create({
                    name: fieldName,
                    modelMeta: this
                });
            }
        }

        /*
         * If a property name ends with 'ViewPath', then the corresponding
         * route name is returned. This is useful when using link-to.
         * The following example will create a link to 'user.model.index
         * (assuming the model is a user) :
         *
         *    {{#link-to model.meta.modelIndexViewPath}}list{{/link-to}}
         *
         * blogPostModel.meta.collectionFavoritesViewPath will return:
         *    'eureka.blog-post.collection.favorites'
         *
         *
         * If an alias is specified for the viewPath in `structure`, the
         * property will resolve in priority the alias. For instance:
         *
         *  {
         *       BlogPost: {
         *           aliases: {
         *               viewPath: {
         *                   modelIndex: 'eureka.blog-post.path.to.model.index'
         *               }
         *           }
         *       }
         *  }
         *
         *  `blogPost.meta.modelIndexViewPath` will return `eureka.blog-post.path.to.model.index`
         */
        if (endsWith(key, 'ViewPath')){
            var viewPath = key.slice(0, key.length - 'ViewPath'.length);
            var dasherizedModelType = this.get('resource').dasherize();
            let _viewPath = viewPath.decamelize().split('_').join('.');
            var eurekaViewPath = `eureka.${dasherizedModelType}.${_viewPath}`;
            return this.getWithDefault(`aliases.views.${viewPath}`, eurekaViewPath);
        }
        return this.get(`content.${key}`);
    }
});