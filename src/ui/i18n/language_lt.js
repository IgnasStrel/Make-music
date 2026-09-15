
export const smoLanguageStringLt = `{
    "dialogs": [
        {
            "ctor": "SuiLoadFileDialog",
            "label": "Įkelti failą",
            "dialogElements": [
                {}
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiSaveFileDialog",
            "label": "Išsaugoti partitūrą",
            "dialogElements": [
                {
                    "label": "Failo pavadinimas",
                    "id": "saveFileName"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiSaveXmlDialog",
            "label": "Išsaugoti partitūrą",
            "dialogElements": [
                {
                    "label": "Failo pavadinimas",
                    "id": "saveFileName"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiPrintFileDialog",
            "label": "Spausdinimas baigtas",
            "dialogElements": [],
            "staticText": {}
        },
        {
            "ctor": "SuiSaveMidiDialog",
            "label": "Išsaugoti partitūrą kaip MIDI",
            "dialogElements": [
                {
                    "label": "Failo pavadinimas",
                    "id": "saveFileName"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiLoadMxmlDialog",
            "label": "Įkelti failą",
            "dialogElements": [
                {},
                {
                    "staticText": {
                        "label": "Įkelti failą"
                    }
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiMeasureDialog",
            "label": "Takto nustatymai",
            "dialogElements": [
                {
                    "label": "Užbėgimas",
                    "id": "pickup"
                },
                {
                    "label": "Tarpas kairėje (px)",
                    "id": "padLeft"
                },
                {
                    "label": "Ištempti turinį",
                    "id": "customStretch"
                },
                {
                    "label": "Proporcingumas",
                    "id": "customProportion"
                },
                {
                    "label": "Tarpas visuose sistemos taktuose",
                    "id": "padAllInSystem"
                },
                {
                    "label": "Lygiuoti stulpelius",
                    "id": "autoJustify"
                },
                {
                    "label": "Teksto pozicija",
                    "id": "measureTextPosition",
                    "options": [
                        {
                            "value": 2,
                            "label": "Kairėje"
                        },
                        {
                            "value": 3,
                            "label": "Dešinėje"
                        },
                        {
                            "value": 0,
                            "label": "Viršuje"
                        },
                        {
                            "value": 1,
                            "label": "Apačioje"
                        }
                    ]
                },
                {
                    "label": "Sistemos pertrauka prieš šį taktą",
                    "id": "systemBreak"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiTempoDialog",
            "label": "Tempo nustatymai",
            "dialogElements": [
                {
                    "label": "Tempo režimas",
                    "id": "tempoMode",
                    "options": [
                        {
                            "value": "duration",
                            "label": "Trukmė (smūgiai/minutė)"
                        },
                        {
                            "value": "text",
                            "label": "Tempo tekstas"
                        },
                        {
                            "value": "custom",
                            "label": "Nurodyti tekstą ir trukmę"
                        }
                    ]
                },
                {
                    "label": "Pasirinktinis tekstas",
                    "id": "customText"
                },
                {
                    "label": "Natų/minutė",
                    "id": "bpm"
                },
                {
                    "label": "Smūgio vienetas",
                    "id": "beatDuration",
                    "options": [
                        {
                            "value": 4096,
                            "label": "Ketvirčio nota"
                        },
                        {
                            "value": 2048,
                            "label": "Aštuntinė nota"
                        },
                        {
                            "value": 6144,
                            "label": "Pailginta ketvirčio nota"
                        },
                        {
                            "value": 8192,
                            "label": "Pusnota"
                        }
                    ]
                },
                {
                    "label": "Tempo tekstas",
                    "id": "tempoText",
                    "options": [
                        {
                            "value": "Larghissimo",
                            "label": "Larghissimo"
                        },
                        {
                            "value": "Grave",
                            "label": "Grave"
                        },
                        {
                            "value": "Lento",
                            "label": "Lento"
                        },
                        {
                            "value": "Largo",
                            "label": "Largo"
                        },
                        {
                            "value": "Larghetto",
                            "label": "Larghetto"
                        },
                        {
                            "value": "Adagio",
                            "label": "Adagio"
                        },
                        {
                            "value": "Adagietto",
                            "label": "Adagietto"
                        },
                        {
                            "value": "Andante",
                            "label": "Andante"
                        },
                        {
                            "value": "Andantino",
                            "label": "Andantino"
                        },
                        {
                            "value": "Moderato",
                            "label": "Moderato"
                        },
                        {
                            "value": "Allegretto",
                            "label": "Allegretto"
                        },
                        {
                            "value": "Allegro",
                            "label": "Allegro"
                        },
                        {
                            "value": "Vivace",
                            "label": "Vivace"
                        },
                        {
                            "value": "Presto",
                            "label": "Presto"
                        },
                        {
                            "value": "Prestissimo",
                            "label": "Prestissimo"
                        }
                    ]
                },
                {
                    "label": "Rodyti taktą",
                    "id": "display"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiTimeSignatureDialog",
            "label": "Pasirinktinis taktrodis",
            "dialogElements": [
                {
                    "label": "Smūgiai/taktas",
                    "id": "numerator"
                },
                {
                    "label": "Smūgio reikšmė",
                    "id": "denominator",
                    "options": [
                        {
                            "value": 8,
                            "label": "8"
                        },
                        {
                            "value": 4,
                            "label": "4"
                        },
                        {
                            "value": 2,
                            "label": "2"
                        }
                    ]
                },
                {
                    "label": "Rodyti",
                    "id": "display"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiScoreViewDialog",
            "label": "Partitūros rodinys",
            "dialogElements": [
                {
                    "label": "Rodyti notų eilutę",
                    "id": "scoreView"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiScoreIdentificationDialog",
            "label": "Partitūros informacija",
            "dialogElements": [
                {
                    "label": "Pavadinimas",
                    "id": "title"
                },
                {
                    "label": "Paantraštė",
                    "id": "subTitle"
                },
                {
                    "label": "Kompozitorius",
                    "id": "composer"
                },
                {
                    "label": "Autorių teisės",
                    "id": "copyright"
                }
            ],
            "staticText": {
                "titleText": "Pavadinimas",
                "subTitleText": "Paantraštė",
                "copyrightText": "Autorių teisės",
                "composerText": "Kompozitorius",
                "show": "Rodyti"
            }
        },
        {
            "ctor": "SuiGlobalLayoutDialog",
            "label": "Bendrieji nustatymai",
            "dialogElements": [
                {
                    "label": "Partitūros pavadinimas",
                    "id": "scoreName"
                },
                {
                    "label": "Groti pasirinkimą",
                    "id": "autoPlay"
                },
                {
                    "label": "Automatinis žymeklio perkėlimas",
                    "id": "autoAdvance"
                },
                {
                    "label": "Natų tarpai",
                    "id": "noteSpacing"
                },
                {
                    "label": "Puslapio dydis",
                    "id": "pageSize",
                    "options": [
                        {
                            "value": "letter",
                            "label": "Laiškas"
                        },
                        {
                            "value": "letterLandscape",
                            "label": "Laiškas (gulsčias)"
                        },
                        {
                            "value": "tabloid",
                            "label": "Tabloidas (11x17)"
                        },
                        {
                            "value": "A4",
                            "label": "A4"
                        },
                        {
                            "value": "custom",
                            "label": "Pasirinktinis"
                        }
                    ]
                },
                {
                    "label": "Puslapio plotis (px)",
                    "id": "pageWidth"
                },
                {
                    "label": "Puslapio aukštis (px)",
                    "id": "pageHeight"
                },
                {
                    "label": "% Mastelis",
                    "id": "zoomScale"
                },
                {
                    "label": "% Natų dydis",
                    "id": "svgScale"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiScoreFontDialog",
            "label": "Šriftas",
            "dialogElements": [
                {
                    "label": "Graviravimo šriftas",
                    "id": "engravingFont",
                    "options": [
                        {
                            "value": "Bravura",
                            "label": "Bravura"
                        },
                        {
                            "value": "Gonville",
                            "label": "Gonville"
                        },
                        {
                            "value": "Petaluma",
                            "label": "Petaluma"
                        },
                        {
                            "value": "Leland",
                            "label": "Leland"
                        }
                    ]
                },
                {
                    "label": "Akordų šriftas",
                    "id": "chordFont"
                },
                {
                    "label": "Teksto šriftas",
                    "id": "lyricFont"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiLayoutDialog",
            "label": "Puslapio išdėstymai",
            "dialogElements": [
                {
                    "label": "Taikyti puslapiui",
                    "id": "applyToPage",
                    "options": [
                        {
                            "value": -1,
                            "label": "Visi"
                        },
                        {
                            "value": -2,
                            "label": "Visi likę"
                        },
                        {
                            "value": 1,
                            "label": "1 puslapis"
                        }
                    ]
                },
                {
                    "label": "Kairysis paraštė (px)",
                    "id": "leftMargin"
                },
                {
                    "label": "Dešinysis paraštė (px)",
                    "id": "rightMargin"
                },
                {
                    "label": "Viršutinis paraštė (px)",
                    "id": "topMargin"
                },
                {
                    "label": "Apatinis paraštė (px)",
                    "id": "bottomMargin"
                },
                {
                    "label": "Tarpas tarp sistemų",
                    "id": "interGap"
                },
                {
                    "label": "Tarpas sistemoje",
                    "id": "intraGap"
                },
                {
                    "staticText": {
                        "label": "Puslapio išdėstymai"
                    }
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiSlurAttributesDialog",
            "label": "Legato savybės",
            "dialogElements": [
                {
                    "label": "Tarpas",
                    "id": "spacing"
                },
                {
                    "label": "Storumas",
                    "id": "thickness"
                },
                {
                    "label": "X poslinkis",
                    "id": "xOffset"
                },
                {
                    "label": "Y poslinkis",
                    "id": "yOffset"
                },
                {
                    "label": "Pradžios pozicija",
                    "id": "position",
                    "options": [
                        {
                            "value": 1,
                            "label": "Galvutė"
                        },
                        {
                            "value": 2,
                            "label": "Viršus"
                        }
                    ]
                },
                {
                    "label": "Pabaigos pozicija",
                    "id": "position_end",
                    "options": [
                        {
                            "value": 1,
                            "label": "Galvutė"
                        },
                        {
                            "value": 2,
                            "label": "Viršus"
                        }
                    ]
                },
                {
                    "label": "Apversti",
                    "id": "invert"
                },
                {
                    "label": "Valdymo taškas 1 X",
                    "id": "cp1x"
                },
                {
                    "label": "Valdymo taškas 1 Y",
                    "id": "cp1y"
                },
                {
                    "label": "Valdymo taškas 2 X",
                    "id": "cp2x"
                },
                {
                    "label": "Valdymo taškas 2 Y",
                    "id": "cp2y"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiTieAttributesDialog",
            "label": "Ryšio savybės",
            "dialogElements": [
                {
                    "label": "Linijos",
                    "id": "lines"
                }
            ],
            "staticText": {
                "label": "Ryšio savybės",
                "fromNote": "Iš natos",
                "toNote": "Į natą"
            }
        },
        {
            "ctor": "SuiVoltaAttributeDialog",
            "label": "Volta savybės",
            "dialogElements": [
                {
                    "label": "Numeris",
                    "id": "number"
                },
                {
                    "label": "X1 poslinkis",
                    "id": "xOffsetStart"
                },
                {
                    "label": "X2 poslinkis",
                    "id": "xOffsetEnd"
                },
                {
                    "label": "Y poslinkis",
                    "id": "yOffset"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiHairpinAttributesDialog",
            "label": "Crescendo savybės",
            "dialogElements": [
                {
                    "label": "Aukštis",
                    "id": "height"
                },
                {
                    "label": "Y poslinkis",
                    "id": "yOffset"
                },
                {
                    "label": "Dešinysis poslinkis",
                    "id": "xOffsetRight"
                },
                {
                    "label": "Kairysis poslinkis",
                    "id": "xOffsetLeft"
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiStaffGroupDialog",
            "label": "Notų eilučių grupė",
            "dialogElements": [
                {
                    "label": "Eilutės grupėje",
                    "id": "staffGroups"
                },
                {
                    "label": "Kairysis jungtukas",
                    "id": "leftConnector",
                    "options": [
                        {
                            "value": 1,
                            "label": "Laikiklis"
                        },
                        {
                            "value": 0,
                            "label": "Skliaustas"
                        },
                        {
                            "value": 2,
                            "label": "Viengubas"
                        },
                        {
                            "value": 3,
                            "label": "Dvigubas"
                        }
                    ]
                }
            ],
            "staticText": {
                "includeStaff": "Įtraukti eilutę"
            }
        },
        {
            "ctor": "SuiDynamicModifierDialog",
            "label": "Dinamikos savybės",
            "dialogElements": [
                {
                    "label": "Y eilutė",
                    "id": "yOffsetLine"
                },
                {
                    "label": "Y poslinkis (px)",
                    "id": "yOffsetPixels"
                },
                {
                    "label": "X poslinkis",
                    "id": "xOffset"
                },
                {
                    "label": "Tekstas",
                    "id": "text",
                    "options": [
                        {
                            "value": "p",
                            "label": "Piano"
                        },
                        {
                            "value": "pp",
                            "label": "Pianissimo"
                        },
                        {
                            "value": "mp",
                            "label": "Mezzo-Piano"
                        },
                        {
                            "value": "mf",
                            "label": "Mezzo-Forte"
                        },
                        {
                            "value": "f",
                            "label": "Forte"
                        },
                        {
                            "value": "ff",
                            "label": "Fortissimo"
                        },
                        {
                            "value": "sfz",
                            "label": "Sforzando"
                        }
                    ]
                }
            ],
            "staticText": {}
        },
        {
            "ctor": "SuiLyricDialog",
            "label": "Tekstų redaktorius",
            "dialogElements": [
                {
                    "label": "Posmas",
                    "id": "verse",
                    "options": [
                        {
                            "value": 0,
                            "label": "1"
                        },
                        {
                            "value": 1,
                            "label": "2"
                        },
                        {
                            "value": 2,
                            "label": "3"
                        },
                        {
                            "value": 3,
                            "label": "4"
                        }
                    ]
                },
                {
                    "label": "Y korekcija (px)",
                    "id": "translateY"
                },
                {
                    "label": "Šriftas",
                    "id": "font"
                },
                {
                    "label": "Redaguoti tekstus",
                    "id": "lyricEditor",
                    "options": []
                }
            ],
            "staticText": {
                "doneEditing": "Baigti redaguoti tekstus",
                "undo": "Atšaukti tekstus",
                "label": "Tekstų redaktorius"
            }
        },
        {
            "ctor": "SuiChordChangeDialog",
            "label": "Redaguoti akordų simbolį",
            "dialogElements": [
                {
                    "label": "Eiliškumas",
                    "id": "verse",
                    "options": [
                        {
                            "value": 0,
                            "label": "1"
                        },
                        {
                            "value": 1,
                            "label": "2"
                        },
                        {
                            "value": 2,
                            "label": "3"
                        }
                    ]
                },
                {
                    "label": "Y korekcija (px)",
                    "id": "translateY"
                },
                {
                    "label": "Redaguoti tekstą",
                    "id": "chordEditor",
                    "options": []
                },
                {
                    "label": "Akordų simbolis",
                    "id": "chordSymbol",
                    "options": [
                        {
                            "value": "csymDiminished",
                            "label": "Dim"
                        },
                        {
                            "value": "csymHalfDiminished",
                            "label": "Pusiau dim"
                        },
                        {
                            "value": "csymDiagonalArrangementSlash",
                            "label": "Pasviroji"
                        },
                        {
                            "value": "csymMajorSeventh",
                            "label": "Maj7"
                        }
                    ]
                },
                {
                    "label": "Teksto pozicija",
                    "id": "textPosition",
                    "options": [
                        {
                            "value": 1,
                            "label": "Viršutinė raidė"
                        },
                        {
                            "value": 2,
                            "label": "Apatinė raidė"
                        },
                        {
                            "value": 0,
                            "label": "Normalus"
                        }
                    ]
                },
                {
                    "label": "Šriftas",
                    "id": "font"
                },
                {
                    "label": "Koreguoti natos plotį",
                    "id": "adjustWidth",
                    "options": []
                }
            ],
            "staticText": {
                "label": "Redaguoti akordų simbolį",
                "undo": "Atšaukti akordų simbolius",
                "doneEditing": "Baigti redaguoti akordų simbolius"
            }
        },
        {
            "ctor": "SuiTextBlockDialog",
            "label": "Teksto savybės",
            "dialogElements": [
                {
                    "label": "Redaguoti tekstą",
                    "id": "textEditor",
                    "options": []
                },
                {
                    "label": "Įterpti specialų simbolį",
                    "id": "insertCode",
                    "options": [
                        {
                            "value": "@@@",
                            "label": "Puslapiai"
                        },
                        {
                            "value": "###",
                            "label": "Puslapio numeris"
                        }
                    ]
                },
                {
                    "label": "Perkelti tekstą",
                    "id": "textDragger",
                    "options": []
                },
                {
                    "label": "X pozicija (px)",
                    "id": "x"
                },
                {
                    "label": "Y pozicija (px)",
                    "id": "y"
                },
                {
                    "label": "Šrifto informacija",
                    "id": "font"
                },
                {
                    "label": "Teksto bloko savybės",
                    "id": "textBlock"
                },
                {
                    "label": "Puslapio elgsena",
                    "id": "pagination",
                    "options": [
                        {
                            "value": 4,
                            "label": "Kartą"
                        },
                        {
                            "value": 1,
                            "label": "Kiekviename"
                        },
                        {
                            "label": "Lyginiuose"
                        },
                        {
                            "value": 3,
                            "label": "Nelyginiuose"
                        },
                        {
                            "value": 5,
                            "label": "Tolesniuose"
                        }
                    ]
                },
                {
                    "label": "Prisegti prie pasirinkimo",
                    "id": "attachToSelector"
                }
            ],
            "staticText": {
                "label": "Teksto savybės",
                "editorLabel": "Baigti redaguoti tekstą",
                "draggerLabel": "Baigti traukti tekstą"
            }
        }
    ],
    "menus": [
        {
            "ctor": "SuiEditMenu",
            "label": "Redaguoti",
            "menuItems": [
                { "icon": "icon-copy", "text": "Kopijuoti", "value": "copyAction" },
                { "icon": "icon-paste", "text": "Įklijuoti", "value": "pasteAction" },
                { "icon": "", "text": "Įklijuoti akordus", "value": "pasteChordsAction" },
                { "icon": "icon-undo", "text": "Anuliuoti", "value": "undoAction" },
                { "icon": "", "text": "Atšaukti", "value": "cancel" }
            ]
        },
        {
            "ctor": "SuiPartMenu",
            "label": "Dalys",
            "menuItems": [
                { "icon": "", "text": "Sukurti naują dalį/eilutę", "value": "createPart" },
                { "icon": "cancel-circle", "text": "Pašalinti pasirinktas dalis/eilutes", "value": "removePart" },
                { "icon": "", "text": "Dalies savybės", "value": "editPart" },
                { "icon": "", "text": "Puslapio išdėstymas", "value": "pageLayout" },
                { "icon": "", "text": "Rodyti dalinę partitūrą", "value": "view" },
                { "icon": "", "text": "Rodyti viską", "value": "viewAll" },
                { "icon": "", "text": "Instrumento savybės", "value": "editInstrument" },
                { "icon": "", "text": "Gitaros tabulatūra", "value": "tabStave" },
                { "icon": "", "text": "Perkelti dalį aukštyn", "value": "partUp" },
                { "icon": "", "text": "Perkelti dalį žemyn", "value": "partDown" },
                { "icon": "", "text": "Atšaukti", "value": "cancel" }
            ]
        },
        {
            "ctor": "SuiVoiceMenu",
            "label": "Balsai",
            "menuItems": [
                { "icon": "", "text": "1 balsas", "value": "voice0" },
                { "icon": "", "text": "2 balsas", "value": "voice1" },
                { "icon": "", "text": "3 balsas", "value": "voice2" },
                { "icon": "", "text": "4 balsas", "value": "voice3" },
                { "icon": "", "text": "Sukeisti 1 ir 2", "value": "0To1" },
                { "icon": "", "text": "Sukeisti 1 ir 3", "value": "0To2" },
                { "icon": "", "text": "Sukeisti 1 ir 4", "value": "0To3" },
                { "icon": "", "text": "Sukeisti 2 ir 3", "value": "1To2" },
                { "icon": "", "text": "Sukeisti 2 ir 4", "value": "1To3" },
                { "icon": "", "text": "Sukeisti 3 ir 4", "value": "2To3" },
                { "icon": "", "text": "Pašalinti balsą", "value": "removeVoice" },
                { "icon": "", "text": "Atšaukti", "value": "cancel" }
            ]
        },
        {
            "ctor": "SuiBeamMenu",
            "label": "Sijos",
            "menuItems": [
                { "icon": "icon-beamBreak", "text": "Pašalinti sijas", "value": "toggleBeamMenuOption" },
                { "icon": "icon-beamStart", "text": "Sujungti sijomis", "value": "beamSelectionsMenuOption" },
                { "icon": "", "text": "Keisti koto kryptį (auto, aukštyn, žemyn)", "value": "toggleBeamDirection" },
                { "icon": "", "text": "Atšaukti", "value": "cancel" }
            ]
        },
        {
            "ctor": "SuiTupletMenu",
            "label": "Trioletai",
            "menuItems": [
                { "icon": "icon-triplet", "text": "Padaryti trioletą", "value": "tripletMenuOption" },
                { "icon": "icon-quint", "text": "Padaryti kvintolę", "value": "quintupletMenuOption" },
                { "icon": "icon-sept", "text": "Padaryti septolę", "value": "sevenTupletMenuOption" },
                { "icon": "", "text": "Pasirinktinis tupletas", "value": "customTupletDialog" },
                { "icon": "", "text": "Pašalinti tupletą", "value": "unmakeTuplet" },
                { "icon": "", "text": "Atšaukti", "value": "cancel" }
            ]
        },
        {
            "ctor": "SuiNoteMenu",
            "label": "Natos",
            "menuItems": [
                { "icon": "", "text": "Perjungti užuominą", "value": "toggleCueMenuOption" },
                { "icon": "", "text": "Arpedžas", "value": "arpeggioDialog" },
                { "icon": "", "text": "Galvutė ir kotas", "value": "noteHeadDialog" },
                { "icon": "", "text": "Aukščiai", "value": "pitchDialog" },
                { "icon": "", "text": "Malonės natos", "value": "graceNotes" },
                { "icon": "", "text": "Keisti raktą", "value": "clefNoteDialog" },
                { "icon": "", "text": "Perjungti pedalo atleidimą", "value": "togglePedalRelease" },
                { "icon": "", "text": "Ornamentai", "value": "ornamentDialog" },
                { "icon": "", "text": "Trukmės", "value": "durationDialog" },
                { "icon": "", "text": "Artikuliacija", "value": "articulationDialog" },
                { "icon": "", "text": "Mikrotonai", "value": "microtoneDialog" },
                { "icon": "", "text": "Atšaukti", "value": "cancel" }
            ]
        },
        {
            "ctor": "SuiTextMenu",
            "label": "Tekstas",
            "menuItems": [
                { "icon": "", "text": "Repeticijos žymė", "value": "rehearsalLetter" },
                { "icon": "", "text": "Partitūros tekstas", "value": "textBlock" },
                { "icon": "", "text": "Akordų simboliai", "value": "chordChanges" },
                { "icon": "", "text": "Žodžiai", "value": "lyricMenu" },
                { "icon": "", "text": "Dinamika", "value": "dynamicsMenu" },
                { "icon": "", "text": "Atšaukti", "value": "cancel" }
            ]
        },
        {
            "ctor": "SuiScoreMenu",
            "label": "Partitūros nustatymai",
            "menuItems": [
                { "icon": "", "text": "Smoosic nustatymai", "value": "preferences" },
                { "icon": "", "text": "Rodyti viską", "value": "viewAll" },
                { "icon": "", "text": "Bendrasis išdėstymas", "value": "globalLayout" },
                { "icon": "", "text": "Puslapio išdėstymas", "value": "pageLayout" },
                { "icon": "", "text": "Garso nustatymai", "value": "audioSettings" },
                { "icon": "", "text": "Eilučių grupės", "value": "staffGroups" },
                { "icon": "", "text": "Šriftai", "value": "fonts" },
                { "icon": "", "text": "Partitūros informacija", "value": "identification" },
                { "icon": "", "text": "Transponuoti partitūrą", "value": "transposeScore" },
                { "icon": "", "text": "Atšaukti", "value": "cancel" }
            ]
        },
        {
            "ctor": "SuiDynamicsMenu",
            "label": "Dinamika",
            "menuItems": [
                {
                    "icon": "pianissimo",
                    "text": "Pianissimo",
                    "value": "pp"
                },
                {
                    "icon": "piano",
                    "text": "Piano",
                    "value": "p"
                },
                {
                    "icon": "mezzopiano",
                    "text": "Mezzo-piano",
                    "value": "mp"
                },
                {
                    "icon": "mezzoforte",
                    "text": "Mezzo-forte",
                    "value": "mf"
                },
                {
                    "icon": "forte",
                    "text": "Forte",
                    "value": "f"
                },
                {
                    "icon": "fortissimo",
                    "text": "Fortissimo",
                    "value": "ff"
                },
                {
                    "icon": "sfz",
                    "text": "Sforzando",
                    "value": "sfz"
                },
                {
                    "icon": "",
                    "text": "Atšaukti",
                    "value": "cancel"
                }
            ]
        },
        {
            "ctor": "SuiFileMenu",
            "label": "Failas",
            "menuItems": [
                {
                    "icon": "folder-new",
                    "text": "Naujas",
                    "value": "newFile"
                },
                {
                    "icon": "folder-open",
                    "text": "Atidaryti",
                    "value": "openFile"
                },
                {
                    "icon": "",
                    "text": "Greitasis išsaugojimas",
                    "value": "quickSave"
                },
                {
                    "icon": "folder-save",
                    "text": "Išsaugoti",
                    "value": "saveFile"
                },
                {
                    "icon": "",
                    "text": "Spausdinti",
                    "value": "printScore"
                },
                {
                    "icon": "",
                    "text": "Importuoti MusicXML",
                    "value": "importMxml"
                },
                {
                    "icon": "",
                    "text": "Eksportuoti MusicXML",
                    "value": "exportXml"
                },
                {
                    "icon": "",
                    "text": "Eksportuoti SMO (validacijai)",
                    "value": "SMOJSON"
                },
                {
                    "icon": "",
                    "text": "Eksportuoti MIDI",
                    "value": "exportMidi"
                },
                {
                    "icon": "",
                    "text": "Importuoti MIDI",
                    "value": "importMidi"
                },
                {
                    "icon": "",
                    "text": "Eksportuoti Vex",
                    "value": "exportVex"
                },
                {
                    "icon": "",
                    "text": "Atšaukti",
                    "value": "cancel"
                }
            ]
        },
        {
            "ctor": "SuiKeySignatureMenu",
            "label": "Raktas",
            "menuItems": [
                {
                    "icon": "key-sig-c",
                    "text": "C dur",
                    "value": "KeyOfC"
                },
                {
                    "icon": "key-sig-f",
                    "text": "F dur",
                    "value": "KeyOfF"
                },
                {
                    "icon": "key-sig-g",
                    "text": "G dur",
                    "value": "KeyOfG"
                },
                {
                    "icon": "key-sig-bb",
                    "text": "B dur",
                    "value": "KeyOfBb"
                },
                {
                    "icon": "key-sig-d",
                    "text": "D dur",
                    "value": "KeyOfD"
                },
                {
                    "icon": "key-sig-eb",
                    "text": "Es dur",
                    "value": "KeyOfEb"
                },
                {
                    "icon": "key-sig-a",
                    "text": "A dur",
                    "value": "KeyOfA"
                },
                {
                    "icon": "key-sig-ab",
                    "text": "As dur",
                    "value": "KeyOfAb"
                },
                {
                    "icon": "key-sig-e",
                    "text": "E dur",
                    "value": "KeyOfE"
                },
                {
                    "icon": "key-sig-bd",
                    "text": "Des dur",
                    "value": "KeyOfDb"
                },
                {
                    "icon": "key-sig-b",
                    "text": "H dur",
                    "value": "KeyOfB"
                },
                {
                    "icon": "key-sig-fs",
                    "text": "Fis dur",
                    "value": "KeyOfF#"
                },
                {
                    "icon": "key-sig-cs",
                    "text": "Cis dur",
                    "value": "KeyOfC#"
                },
                {
                    "icon": "",
                    "text": "Atšaukti",
                    "value": "cancel"
                }
            ]
        },
        {
            "ctor": "SuiMeasureMenu",
            "label": "Taktas",
            "menuItems": [
                {
                    "icon": "",
                    "text": "Pridėti taktus",
                    "value": "addMeasures"
                },
                {
                    "icon": "icon-cross",
                    "text": "Ištrinti pasirinktus taktus",
                    "value": "deleteSelected"
                },
                {
                    "icon": "",
                    "text": "Formatuoti taktą",
                    "value": "formatMeasure"
                },
                {
                    "icon": "",
                    "text": "Pabaigos",
                    "value": "endings"
                },
                {
                    "icon": "",
                    "text": "Atstatyti formatavimą",
                    "value": "resetFormatting"
                },
                {
                    "icon": "",
                    "text": "Atšaukti",
                    "value": "cancel"
                }
            ]
        },
        {
            "ctor": "SuiTimeSignatureMenu",
            "label": "Taktrodis",
            "menuItems": [
                {
                    "icon": "sixeight",
                    "text": "6/8",
                    "value": "6/8"
                },
                {
                    "icon": "fourfour",
                    "text": "4/4",
                    "value": "4/4"
                },
                {
                    "icon": "threefour",
                    "text": "3/4",
                    "value": "3/4"
                },
                {
                    "icon": "twofour",
                    "text": "2/4",
                    "value": "2/4"
                },
                {
                    "icon": "twelveeight",
                    "text": "12/8",
                    "value": "12/8"
                },
                {
                    "icon": "seveneight",
                    "text": "7/8",
                    "value": "7/8"
                },
                {
                    "icon": "fiveeight",
                    "text": "5/8",
                    "value": "5/8"
                },
                {
                    "icon": "",
                    "text": "Pasirinktinis",
                    "value": "TimeSigOther"
                },
                {
                    "icon": "",
                    "text": "Atšaukti",
                    "value": "cancel"
                }
            ]
        },
        {
            "ctor": "SuiStaffModifierMenu",
            "label": "Linijos",
            "menuItems": [
                {
                    "icon": "cresc",
                    "text": "Crescendo plaukelis",
                    "value": "crescendo"
                },
                {
                    "icon": "decresc",
                    "text": "Diminuendo plaukelis",
                    "value": "decrescendo"
                },
                {
                    "icon": "slur",
                    "text": "Legato lankas",
                    "value": "slur"
                },
                {
                    "icon": "slur",
                    "text": "Ryšys",
                    "value": "tie"
                },
                {
                    "icon": "",
                    "text": "Pedalo žymė",
                    "value": "pedalMarking"
                },
                {
                    "icon": "ending",
                    "text": "N-oji pabaiga",
                    "value": "ending"
                },
                {
                    "icon": "",
                    "text": "Diminuendo skliaustas",
                    "value": "dimenuendo"
                },
                {
                    "icon": "",
                    "text": "Crescendo skliaustas",
                    "value": "crescendoBracket"
                },
                {
                    "icon": "",
                    "text": "Accelerando",
                    "value": "accel"
                },
                {
                    "icon": "",
                    "text": "Ritardando",
                    "value": "ritard"
                },
                {
                    "icon": "",
                    "text": "Atstatyti legato lankus",
                    "value": "resetSlurs"
                },
                {
                    "icon": "",
                    "text": "Pakartojimo pabaigos",
                    "value": "endings"
                },
                {
                    "icon": "",
                    "text": "Atšaukti",
                    "value": "cancel"
                }
            ]
        },
        {
            "ctor": "SuiLanguageMenu",
            "label": "Kalba",
            "menuItems": [
                {
                    "icon": "",
                    "text": "English",
                    "value": "en"
                },
                {
                    "icon": "",
                    "text": "Lietuvių",
                    "value": "lt"
                },
                {
                    "icon": "",
                    "text": "Atšaukti",
                    "value": "cancel"
                }
            ]
        },
        {
            "ctor": "SuiLibraryMenu",
            "label": "Partitūra",
            "menuItems": [
                {
                    "icon": "",
                    "text": "Bach Invention",
                    "value": "bach"
                },
                {
                    "icon": "",
                    "text": "Postillion-Lied",
                    "value": "postillion"
                },
                {
                    "icon": "",
                    "text": "Jesu Bambino",
                    "value": "bambino"
                },
                {
                    "icon": "",
                    "text": "Handel Messiah 1-1",
                    "value": "handel"
                },
                {
                    "icon": "",
                    "text": "Precious Lord",
                    "value": "preciousLord"
                },
                {
                    "icon": "",
                    "text": "In Its Delightful Shade",
                    "value": "shade"
                },
                {
                    "icon": "",
                    "text": "Yama",
                    "value": "yamaJson"
                },
                {
                    "icon": "",
                    "text": "Dichterliebe (xml)",
                    "value": "dichterliebe"
                },
                {
                    "icon": "",
                    "text": "Beethoven - An die ferne Geliebte (xml)",
                    "value": "beethoven"
                },
                {
                    "icon": "",
                    "text": "Mozart - An Chloe (xml)",
                    "value": "mozart"
                },
                {
                    "icon": "",
                    "text": "Joplin - The Entertainer (xml)",
                    "value": "joplin"
                },
                {
                    "icon": "",
                    "text": "Atšaukti",
                    "value": "cancel"
                }
            ]
        },
        {
            "ctor": "SuiScoreMenu",
            "label": "Partitūros nustatymai",
            "menuItems": [
                {
                    "icon": "",
                    "text": "Išdėstymas",
                    "value": "layout"
                },
                {
                    "icon": "",
                    "text": "Šriftai",
                    "value": "fonts"
                },
                {
                    "icon": "",
                    "text": "Rodinys",
                    "value": "view"
                },
                {
                    "icon": "",
                    "text": "Partitūros informacija",
                    "value": "identification"
                },
                {
                    "icon": "",
                    "text": "Bendrieji nustatymai",
                    "value": "preferences"
                },
                {
                    "icon": "",
                    "text": "Atšaukti",
                    "value": "cancel"
                }
            ]
        }
    ],
    "buttonText": [
        {
            "buttonId": "helpDialog",
            "buttonText": "Pagalba"
        },
        {
            "buttonId": "makeMusicTitle",
            "buttonText": "Kurti Muziką"
        },
        {
            "buttonId": "addNoteText",
            "buttonText": "Nata"
        },
        {
            "buttonId": "languageMenu",
            "buttonText": "Kalba"
        },
        {
            "buttonId": "fileMenu",
            "buttonText": "Failas"
        },
        {
            "buttonId": "editMenu",
            "buttonText": "Redaguoti"
        },
        {
            "buttonId": "scoreMenu",
            "buttonText": "Partitūra"
        },
        {
            "buttonId": "partMenu",
            "buttonText": "Dalys"
        },
        {
            "buttonId": "staffModifierMenu",
            "buttonText": "Linijos"
        },
        {
            "buttonId": "measureModal",
            "buttonText": "Taktas"
        },
        {
            "buttonId": "voiceMenu",
            "buttonText": "Balsai"
        },
        {
            "buttonId": "beamMenu",
            "buttonText": "Sijos"
        },
        {
            "buttonId": "tupletMenu",
            "buttonText": "Trioletai"
        },
        {
            "buttonId": "noteMenu",
            "buttonText": "Natos"
        },
        {
            "buttonId": "textMenu",
            "buttonText": "Tekstas"
        },
        {
            "buttonId": "libraryMenu",
            "buttonText": "Biblioteka"
        },
        {
            "buttonId": "addStaffMenu",
            "buttonText": "Eilutės"
        },
        {
            "buttonId": "measureModal",
            "buttonText": "Taktas"
        },
        {
            "buttonId": "tempoModal",
            "buttonText": "Tempas"
        },
        {
            "buttonId": "timeSignatureMenu",
            "buttonText": "Taktrodis"
        },
        {
            "buttonId": "keyMenu",
            "buttonText": "Raktas"
        },
        {
            "buttonId": "staffModifierMenu",
            "buttonText": "Linijos"
        },
        {
            "buttonId": "instrumentModal",
            "buttonText": "Instrumentas"
        },
        {
            "buttonId": "pianoModal",
            "buttonText": "Pianinas"
        },
        {
            "buttonId": "layoutMenu",
            "buttonText": "Partitūra"
        },
        {
            "buttonId": "keySignature",
            "buttonText": "Raktas"
        },
        {
            "buttonId": "ribbonTempo",
            "buttonText": "Tempas"
        },
        {
            "buttonId": "ribbonTime",
            "buttonText": "Laikas"
        },
        {
            "buttonId": "UpOctaveButton",
            "buttonText": "8va"
        },
        {
            "buttonId": "DownOctaveButton",
            "buttonText": "8vb"
        },
        {
            "buttonId": "moreNavButtons",
            "buttonText": "..."
        },
        {
            "buttonId": "dcAlCoda",
            "buttonText": "DC Al Coda"
        },
        {
            "buttonId": "dsAlCoda",
            "buttonText": "DS Al Coda"
        },
        {
            "buttonId": "dcAlFine",
            "buttonText": "DC Al Fine"
        },
        {
            "buttonId": "dsAlFine",
            "buttonText": "DS Al Fine"
        },
        {
            "buttonId": "toCoda",
            "buttonText": "į Coda"
        },
        {
            "buttonId": "fine",
            "buttonText": "Fine"
        },
        {
            "buttonId": "moreStaffButtons",
            "buttonText": "..."
        }
    ]
}`;
