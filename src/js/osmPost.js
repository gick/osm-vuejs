
import xmljs from 'xml-js'
var osmAuth = require("osm-auth");
var auth = osmAuth({
    oauth_secret: 'ycJOK6xrlW0tPXb280k1VLkH4zGlsaGyTPm4vGvr',
    oauth_consumer_key: '1zPARMhKbBJfy6lZa9Jt3SvXOM4D3bxr1s3pMly0'
});
import initOSM from './initOSM'
import uploadOSMPost from './uploadPost'
import {EventBus} from './osmBus'

let initOSMasXML = xmljs.json2xml(initOSM)
let setAttributes = function (releve, uploadPost) {
    let kv = {
        attributes: {
            k: "key",
            v: "value"
        },
        name: "tag",
        type: "element"
    }


    if (releve.specie) {
        let specieKV = _.cloneDeep(kv)
        specieKV.attributes.k = "species"
        specieKV.attributes.v = releve.specie
        uploadPost.elements[0].elements[0].elements[0].elements.push(specieKV)
    }

    if (releve.genus) {
        let genusKV = _.cloneDeep(kv)
        genusKV.attributes.k = "genus"
        genusKV.attributes.v = releve.genus
        uploadPost.elements[0].elements[0].elements[0].elements.push(genusKV)
    }

    if (releve.common) {
        let commonKV = _.cloneDeep(kv)
        commonKV.attributes.k = "name:fr"
        commonKV.attributes.v = releve.common
        uploadPost.elements[0].elements[0].elements[0].elements.push(commonKV)
    }


}
let createTreeRequest = function (releve) {
    let uploadPost=_.cloneDeep(uploadOSMPost)
    auth.xhr({
        method: 'PUT', path: '/api/0.6/changeset/create', dataType: "text/xml",
        options: { header: { "Content-Type": "text/xml" } },
        content: initOSMasXML
    },
        function (err, details) {
            let urlUpload = '/api/0.6/changeset/' + details + '/upload'
            let urlClose = '/api/0.6/changeset/' + details + '/close'

            uploadPost.elements[0].elements[0].elements[0].attributes.changeset = details
            uploadPost.elements[0].elements[0].elements[0].attributes.lon = releve.location.coordinates[0]
            uploadPost.elements[0].elements[0].elements[0].attributes.lat = releve.location.coordinates[1]
            setAttributes(releve,uploadPost)

            console.log(uploadPost)
            let uploadPostXML=xmljs.json2xml(uploadPost)
            auth.xhr({
                method: 'POST', path: urlUpload, dataType: "text/xml",
                options: { header: { "Content-Type": "text/xml" } },
                content: uploadPostXML        
            },function(err,details){
                console.log(details)
                auth.xhr({
                    method: 'PUT', path: urlClose, dataType: "text/xml",
                    options: { header: { "Content-Type": "text/xml" } }
                },function(){
                    EventBus.$emit('updateOSM')

                })
            
            },function(err,details){
            })
        })

}

export default createTreeRequest