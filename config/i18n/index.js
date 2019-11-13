export default {
    "it": {
      "sdk": {
        search: {
          all: 'TUTTE',
          layer_not_searchable: "Il layer non è ricercabile"
        },
        print: {
          no_layers: 'Nessun Layer visibile',
          scale: "Scala",
          format: "Formato",
          rotation: "Rotazione"
        },
        errors: {
          layers: {
            load: "Alcuni layers presenti nel progetto non sono attualmente disponibili e quindi non compaiono nell'attuale visualizzazione"
          }
        },
        metadata: {
          "title": "Metadati",
          'groups': {
            'general': {
              'title': 'GENERALE',
              'fields': {
                'title': 'TITOLO',
                'name': 'NOME',
                'description': "DESCRIZIONE",
                'abstract': "ABSTRACT",
                'keywords': 'PAROLE CHIAVE',
                "fees": "TASSE",
                "accessconstraints": "LIMITI DI ACCESSO",
                'contactinformation': "CONTATTI",
                'subfields': {
                  'contactinformation': {
                    'contactelectronicmailaddress': "Email",
                    'personprimary': 'Riferimenti',
                    'contactvoicetelephone': 'Telefono',
                    'contactorganization': 'Organizzazione',
                    'contactposition': 'Posizione',
                    'contactperson': 'Persona'
                  }
                },
                'wms_url': "WMS"
              }
            },
            'spatial':{
              'title': 'INFO SPAZIALI',
              'fields' : {
                'crs': 'EPSG',
                'extent': 'BBOX'
              }
            },
            'layers': {
              'title': 'STRATI',
              'groups' : {
                'general': 'GENERALE',
                'spatial': 'INFO SPAZIALI'
              },
              'fields': {
                'layers': 'STRATI',
                'subfields': {
                  'crs': 'EPSG',
                  'bbox': 'BBOX',
                  'title': "TITOLO",
                  'name': 'NOME',
                  'geometrytype': 'GEOMETRIA',
                  'source': 'SORGENTE',
                  'attributes': 'ATTRIBUTI',
                  'abstract': 'ABSTRACT',
                  'attribution': 'ATTRIBUTION',
                  'keywords': "PAROLE CHIAVE",
                  'metadataurl':'METADATA URL',
                  'dataurl': "DATA URL"
                }
              }
            }
          }
        },
        mapcontrols: {
          query: {
            actions: {
              show_map: {
                hint: "Visualizza sulla mappa"
              }
            }
          },
          querybypolygon: {
            help: `<h4>Guida - Query By Polygon</h4>
                  <ul style="padding-left: 10px;">
                    <li style="font-size:0.8em;">Seleziona uno strato poligonale in legenda.</li>
                    <li style="font-size:0.8em;">Assicurati che lo strato sia visibile in mappa.</li>
                    <li style="font-size:0.8em;">Clicca su una geometria dello strato selezionato.</li>
                  </ul>`
          },
          querybybbox: {
            help: `<h4>Guida - Query BBox layer</h4>
                   <ul style="padding-left: 10px;">
                    <li style="font-size:0.8em;">Disegna un rettangolo per interrogare gli strati evidenziati in giallo</li>
                   </ul>`
          },
          measures: {
            length: {
              tooltip: "Lunghezza",
              help: "Clicca sulla mappa per continuare a disegnare la linea.<br>CANC se si vuole cancellare l\'ultimo vertice inserito",
            },
            area: {
              tooltip: "Area",
              help: "Click per continuare a disegnare il poligono.<br>CANC se si vuole cancellare l'ultimo vertice inserito"
            }
          }
        },
        relations: {
          relation_data: 'Dati Relazione',
          no_relations_found: 'Nessuna relazione trovata',
          back_to_relations: 'Ritorna alle relazioni',
          list_of_relations_feature: 'Lista delle relazioni della feature',
          error_missing_father_field: "Il campo relazionato non esiste"
        },
        workflow: {
          steps: {
            title: 'Passi'
          }
        },
        form: {
          loading: 'Caricamento ...',
          inputs: {
            input_validation_mutually_exclusive: "Campo mutualmente esclusivo con ",
            input_validation_error: "Campo obbligatorio o tipo valore non corretto",
            input_validation_min_field: "Valore deve essere magiore uguale a quello del camp ",
            input_validation_max_field: "Valore deve essere minore uguale a quello del campo ",
            input_validation_exclude_values: "Campo deve contenere un valore diverso",
            integer: "intero",
            text: "testuale",
            textarea: "testuale",
            string: "stringa",
            date: "data",
            float: "float",
            table: "table"
          },
          footer: {
            required_fields: "Campi richiesti"
          },
          messages: {
            qgis_input_widget_relation: "Gestisci le relazioni tramite form dedicato"
          }
        },
        catalog: {
          menu: {
            wms: {
              title:"",
              copy: "Clicca qui per copiare url",
              copied: "Copiato"
            }
          }
        }
      }
    },
    "en": {
      "sdk": {
        search: {
          all: 'ALL',
          layer_not_searchable: "Layer not searchable"
        },
        print: {
          no_layers: 'No Layer to print',
          scale: "Scale",
          format: "Format",
          rotation: "Rotation"
        },
        errors: {
          layers: {
            load: "Some layers are not available"
          }
        },
        metadata: {
          'title': 'Metadata',
          'groups': {
            'general': {
              'title': 'GENERAL',
              'fields': {
                'title': 'TITLE',
                'name': 'NAME',
                'description': "DESCRIPTION",
                'abstract': "ABASTRACT",
                'keywords': 'KEYWORDS',
                "fees": "FEES",
                "accessconstraints": "ACCESS CONSTRAINT",
                'contactinformation': "CONTACTS",
                'subfields': {
                  'contactinformation': {
                    'contactelectronicmailaddress': "Email",
                    'personprimary': 'Refereces',
                    'contactvoicetelephone': 'Phone',
                    'contactorganization': 'Organization',
                    'contactposition': 'Position',
                    'contactperson': 'Person'
                  }
                },
                'wms_url': "WMS"
              }
            },
            'spatial':{
              'title': 'SPATIAL',
              'fields' : {
                'crs': 'EPSG',
                'extent': 'BBOX'
              }
            },
            'layers': {
              'title': 'LAYERS',
              'fields': {
                'layers': 'LAYERS',
                'subfields': {
                  'crs': 'EPSG',
                  'bbox': 'BBOX',
                  'title': "TITLE",
                  'name': 'NAME',
                  'geometrytype': 'GEOMETRY',
                  'source': 'SOURCE',
                  'attributes': 'ATTRIBUTES',
                  'abstract': 'ABSTRACT',
                  'attribution': 'ATTRIBUTION',
                  'keywords': "PAROLE CHIAVE",
                  'metadataurl':'METADATA URL',
                  'dataurl': "DATA URL"
                }
              },
              'groups' : {
                'general': 'GENERAL',
                'spatial': 'SPATIAL'
              }
            }
          }
        },
        mapcontrols: {
          query: {
            actions: {
              show_map: {
                hint: "Show on map"
              }
            }
          },
          querybypolygon: {
            help: `<h4>Guide - Query By Polygon</h4>
                  <ul style="padding-left: 10px;">
                    <li style="font-size:0.8em;">Select a polygon layer on TOC.</li>
                    <li style="font-size:0.8em;">Be sure that layer is visible.</li>
                    <li style="font-size:0.8em;">Click on a feature of selected layer.</li>
                  </ul>`
          },
          querybybbox: {
            help: `<h4>Guide - Query BBox layer</h4>
                   <ul style="padding-left: 10px;">
                    <li style="font-size:0.8em;">Draw a square on map to query underlined layers on TOC</li>
                   </ul>`
          },
          measures: {
            length: {
              tooltip: "Length",
              help: "Click on map to draw the line. Press <br>CANC if you want delete last vertex",
            },
            area: {
              tooltip: "Area",
              help: "Click to draw poligon.Press <br>CANC if you want delete last vertex"
            }
          }
        },
        relations: {
          relation_data: 'Relation data',
          no_relations_found: 'No relations found',
          back_to_relations: 'Back to relations',
          list_of_relations_feature: 'List of relations of feature',
          error_missing_father_field: "Field is missing"
        },
        workflow: {
          steps: {
            title: 'Steps'
          }
        },
        form: {
          loading: 'Loading ...',
          inputs: {
            input_validation_mutually_exclusive: "Field mutually exclusive with ",
            input_validation_error: "Mandatory Field or wrong data type",
            input_validation_min_field: "Value has to be more/equal to field value  ",
            input_validation_max_field: "Value has to be less/equal to field value ",
            input_validation_exclude_values: "Value has to be unique",
            integer: "integer",
            text: "text",
            textarea: "text",
            string: "string",
            date: "date",
            float: "float",
            table: "table"
          },
          footer: {
            "required_fields": "Required fields"
          },
          messages: {
            qgis_input_widget_relation: "Use relation specific form to work with relation"
          }
        },
        catalog: {
          menu: {
            wms: {
              titel:"",
              copy: "Click here to copy url",
              copied: "Copied"
            }
          }
        }
      }
    }
 };
