const scheme = [
    "container",
    [
        {
            name: "id",
            type: [
                "mapper",
                {
                    type: "varint",
                    mappings: {
                        /* Server */
                        0: "client_voice",
                        1: "voice_channel_switch",
                        2: "voice_mute",
                        16: "voice",
                        17: "voice_channel",
                        18: "voice_channel_remove",
                        19: "voice_channel_update",
                        /* Client */
                        3: "cooldown",
                        4: "hologram",
                        5: "hologram_update",
                        6: "hologram_remove",
                        7: "nametags_override",
                        8: "nametags_update",
                        9: "notification",
                        10: "server_rule",
                        11: "server_update",
                        12: "staff_mods",
                        13: "teammates",
                        14: "title",
                        15: "update_world",
                        20: "world_border",
                        21: "world_border_remove",
                        22: "wolrd_border_update",
                        25: "ghost",
                        28: "boss_bar",
                        29: "world_border_create_new",
                        30: "world_border_update_new",
                        31: "mod_settings",
                        /* Shared */
                        26: "emote_broadcast",
                        23: "waypoint_add",
                        24: "waypoint_remove"
                    }
                }
            ]
        },
        {
            anon: true,
            type: [
                "switch",
                {
                    compareTo: "id",
                    fields: {
                        client_voice: [
                            "container",
                            [
                                {
                                    name: "blob",
                                    type: "ByteArray"
                                }
                            ]
                        ],
                        voice_channel_switch: [
                            "container",
                            [
                                {
                                    name: "switchingTo",
                                    type: "UUID"
                                }
                            ]
                        ],
                        voice_mute: [
                            "container",
                            [
                                {
                                    name: "muting",
                                    type: "UUID"
                                },
                                {
                                    name: "volume",
                                    type: "varint"
                                }
                            ]
                        ],
                        voice: [
                            "container",
                            [
                                {
                                    name: "senders",
                                    type: [
                                        "array",
                                        {
                                            countType: "varint",
                                            type: "UUID"
                                        }
                                    ]
                                },
                                {
                                    name: "blob",
                                    type: "ByteArray"
                                }
                            ]
                        ],
                        voice_channel: [
                            "container",
                            [
                                {
                                    name: "channel",
                                    type: "UUID"
                                },
                                {
                                    name: "name",
                                    type: "string"
                                },
                                {
                                    name: "players",
                                    type: [
                                        "array",
                                        {
                                            countType: "varint",
                                            type: [
                                                "container",
                                                [
                                                    {
                                                        name: "player",
                                                        type: "UUID"
                                                    },
                                                    {
                                                        name: "displayName",
                                                        type: "string"
                                                    }
                                                ]
                                            ]
                                        }
                                    ]
                                }
                            ]
                        ],
                        voice_channel_remove: [
                            "container",
                            [
                                {
                                    name: "channel",
                                    type: "UUID"
                                }
                            ]
                        ],
                        voice_channel_update: [
                            "container",
                            [
                                {
                                    name: "status",
                                    type: "varint"
                                },
                                {
                                    name: "channel",
                                    type: "UUID"
                                },
                                {
                                    name: "uuid",
                                    type: "UUID"
                                },
                                {
                                    name: "name",
                                    type: "string"
                                }
                            ]
                        ],
                        cooldown: [
                            "container",
                            [
                                {
                                    name: "message",
                                    type: "string"
                                },
                                {
                                    name: "durationMs",
                                    type: "i64"
                                },
                                {
                                    name: "iconId",
                                    type: "i32"
                                }
                            ]
                        ],
                        hologram: [
                            "container",
                            [
                                {
                                    name: "uuid",
                                    type: "UUID"
                                },
                                {
                                    name: "x",
                                    type: "f64"
                                },
                                {
                                    name: "y",
                                    type: "f64"
                                },
                                {
                                    name: "z",
                                    type: "f64"
                                },
                                {
                                    name: "lines",
                                    type: [
                                        "array",
                                        {
                                            countType: "varint",
                                            type: "string"
                                        }
                                    ]
                                }
                            ]
                        ],
                        hologram_update: [
                            "container",
                            [
                                {
                                    name: "uuid",
                                    type: "UUID"
                                },
                                {
                                    name: "lines",
                                    type: [
                                        "array",
                                        {
                                            countType: "varint",
                                            type: "string"
                                        }
                                    ]
                                }
                            ]
                        ],
                        hologram_remove: [
                            "container",
                            [
                                {
                                    name: "uuid",
                                    type: "UUID"
                                }
                            ]
                        ],
                        nametags_override: [
                            "container",
                            [
                                {
                                    name: "player",
                                    type: "UUID"
                                },
                                {
                                    name: "present",
                                    type: "bool"
                                },
                                {
                                    name: "data",
                                    type: [
                                        "switch",
                                        {
                                            compareTo: "present",
                                            fields: {
                                                false: "void",
                                                true: [
                                                    "container",
                                                    [
                                                        {
                                                            name: "tags",
                                                            type: [
                                                                "array",
                                                                {
                                                                    countType: "varint",
                                                                    type: "string"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        ],
                        nametags_update: [
                            "container",
                            [
                                {
                                    name: "size",
                                    type: "varint"
                                },
                                {
                                    name: "players",
                                    type: [
                                        "switch",
                                        {
                                            compareTo: "size",
                                            fields: {
                                                "-1": "void"
                                            },
                                            default: [
                                                "array",
                                                {
                                                    count: "size",
                                                    type: [
                                                        "container",
                                                        [
                                                            {
                                                                name: "player",
                                                                type: "UUID"
                                                            },
                                                            {
                                                                name: "tags",
                                                                type: [
                                                                    "array",
                                                                    {
                                                                        countType: "varint",
                                                                        type: "string"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        ],
                        notification: [
                            "container",
                            [
                                {
                                    name: "message",
                                    type: "string"
                                },
                                {
                                    name: "durationMs",
                                    type: "i64"
                                },
                                {
                                    name: "level",
                                    type: "string"
                                }
                            ]
                        ],
                        server_rule: [
                            "container",
                            [
                                {
                                    name: "rule",
                                    type: "string"
                                },
                                {
                                    name: "boolean",
                                    type: "bool"
                                },
                                {
                                    name: "integer",
                                    type: "i32"
                                },
                                {
                                    name: "float",
                                    type: "f32"
                                },
                                {
                                    name: "string",
                                    type: "string"
                                }
                            ]
                        ],
                        server_update: [
                            "container",
                            [
                                {
                                    name: "server",
                                    type: "string"
                                }
                            ]
                        ],
                        staff_mods: [
                            "container",
                            [
                                {
                                    name: "mod",
                                    type: "string"
                                },
                                {
                                    name: "state",
                                    type: "bool"
                                }
                            ]
                        ],
                        teammates: [
                            "container",
                            [
                                {
                                    name: "leaderPresent",
                                    type: "bool"
                                },
                                {
                                    name: "leader",
                                    type: [
                                        "switch",
                                        {
                                            compareTo: "leaderPresent",
                                            fields: {
                                                true: "UUID"
                                            },
                                            default: "void"
                                        }
                                    ]
                                },
                                {
                                    name: "lastMs",
                                    type: "i64"
                                },
                                {
                                    name: "players",
                                    type: [
                                        "array",
                                        {
                                            countType: "varint",
                                            type: [
                                                "container",
                                                {
                                                    name: "player",
                                                    type: "UUID"
                                                },
                                                {
                                                    name: "posMap",
                                                    type: [
                                                        "array",
                                                        {
                                                            countType: "varint",
                                                            type: [
                                                                "container",
                                                                {
                                                                    name: "key",
                                                                    type: "double"
                                                                },
                                                                {
                                                                    name: "value",
                                                                    type: "f64"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        ],
                        title: [
                            "container",
                            [
                                {
                                    name: "type",
                                    type: "string"
                                },
                                {
                                    name: "message",
                                    type: "string"
                                },
                                {
                                    name: "scale",
                                    type: "f32"
                                },
                                {
                                    name: "displayTimeMs",
                                    type: "i64"
                                },
                                {
                                    name: "fadeInTimeMs",
                                    type: "i64"
                                },
                                {
                                    name: "fadeOutTimeMs",
                                    type: "i64"
                                }
                            ]
                        ],
                        update_world: [
                            "container",
                            [
                                {
                                    name: "world",
                                    type: "string"
                                }
                            ]
                        ],
                        world_border: [
                            "container",
                            [
                                {
                                    name: "idPresent",
                                    type: "bool"
                                },
                                {
                                    name: "id",
                                    type: [
                                        "switch",
                                        {
                                            compareTo: "idPresent",
                                            fields: {
                                                true: "string"
                                            },
                                            default: "void"
                                        }
                                    ]
                                },
                                {
                                    name: "world",
                                    type: "string"
                                },
                                {
                                    name: "cancelsExit",
                                    type: "bool"
                                },
                                {
                                    name: "canShrinkExpand",
                                    type: "bool"
                                },
                                {
                                    name: "color",
                                    type: "i32"
                                },
                                {
                                    name: "minX",
                                    type: "f64"
                                },
                                {
                                    name: "minZ",
                                    type: "f64"
                                },
                                {
                                    name: "maxX",
                                    type: "f64"
                                },
                                {
                                    name: "maxZ",
                                    type: "f64"
                                }
                            ]
                        ],
                        world_border_remove: [
                            "container",
                            [
                                {
                                    name: "id",
                                    type: "string"
                                }
                            ]
                        ],
                        world_border_update: [
                            "container",
                            [
                                {
                                    name: "id",
                                    type: "string"
                                },
                                {
                                    name: "minX",
                                    type: "f64"
                                },
                                {
                                    name: "minZ",
                                    type: "f64"
                                },
                                {
                                    name: "maxX",
                                    type: "f64"
                                },
                                {
                                    name: "maxZ",
                                    type: "f64"
                                },
                                {
                                    name: "durationTicks",
                                    type: "i32"
                                }
                            ]
                        ],
                        ghost: [
                            "container",
                            [
                                {
                                    name: "addGhostList",
                                    type: [
                                        "array",
                                        {
                                            countType: "varint",
                                            type: "UUID"
                                        }
                                    ]
                                },
                                {
                                    name: "removeGhostList",
                                    type: [
                                        "array",
                                        {
                                            countType: "varint",
                                            type: "UUID"
                                        }
                                    ]
                                }
                            ]
                        ],
                        boss_bar: [
                            "container",
                            [
                                {
                                    name: "action",
                                    type: "varint"
                                },
                                {
                                    name: "data",
                                    type: [
                                        "switch",
                                        {
                                            compareTo: "action",
                                            fields: {
                                                0: [
                                                    "container",
                                                    {
                                                        name: "text",
                                                        type: "string"
                                                    },
                                                    {
                                                        name: "health",
                                                        type: "f32"
                                                    }
                                                ]
                                            },
                                            default: "void"
                                        }
                                    ]
                                }
                            ]
                        ],
                        world_border_create_new: [
                            "container",
                            [
                                {
                                    name: "idPresent",
                                    type: "bool"
                                },
                                {
                                    name: "id",
                                    type: [
                                        "switch",
                                        {
                                            compareTo: "idPresent",
                                            fields: {
                                                true: "string"
                                            },
                                            default: "void"
                                        }
                                    ]
                                },
                                {
                                    name: "world",
                                    type: "string"
                                },
                                {
                                    name: "cancelsEntry",
                                    type: "bool"
                                },
                                {
                                    name: "cancelsExit",
                                    type: "bool"
                                },
                                {
                                    name: "canShrinkExpand",
                                    type: "bool"
                                },
                                {
                                    name: "color",
                                    type: "i32"
                                },
                                {
                                    name: "minX",
                                    type: "f64"
                                },
                                {
                                    name: "minZ",
                                    type: "f64"
                                },
                                {
                                    name: "maxX",
                                    type: "f64"
                                },
                                {
                                    name: "maxZ",
                                    type: "f64"
                                }
                            ]
                        ],
                        world_border_update_new: [
                            "container",
                            [
                                {
                                    name: "id",
                                    type: "string"
                                },
                                {
                                    name: "minX",
                                    type: "f64"
                                },
                                {
                                    name: "minZ",
                                    type: "f64"
                                },
                                {
                                    name: "maxX",
                                    type: "f64"
                                },
                                {
                                    name: "maxZ",
                                    type: "f64"
                                },
                                {
                                    name: "durationTicks",
                                    type: "i32"
                                },
                                {
                                    name: "cancelsEntry",
                                    type: "bool"
                                },
                                {
                                    name: "cancelsExit",
                                    type: "bool"
                                },
                                {
                                    name: "color",
                                    type: "i32"
                                }
                            ]
                        ],
                        mod_settings: [
                            "container",
                            [
                                {
                                    name: "settings",
                                    type: "string"
                                }
                            ]
  
                        ],
                        emote_broadcast: [
                            "container",
                            [
                                {
                                    name: "player",
                                    type: "UUID"
                                },
                                {
                                    name: "emoteId",
                                    type: "i32"
                                }
                            ]
                        ],
                        waypoint_add: [
                            "container",
                            [
                                {
                                    name: "name",
                                    type: "string"
                                },
                                {
                                    name: "world",
                                    type: "string"
                                },
                                {
                                    name: "color",
                                    type: "i32"
                                },
                                {
                                    name: "x",
                                    type: "i32"
                                },
                                {
                                    name: "y",
                                    type: "i32"
                                },
                                {
                                    name: "z",
                                    type: "i32"
                                },
                                {
                                    name: "forced",
                                    type: "bool"
                                },
                                {
                                    name: "visible",
                                    type: "bool"
                                }
                            ]
                        ],
                        waypoint_remove: [
                            "container",
                            [
                                {
                                    name: "name",
                                    type: "string"
                                },
                                {
                                    name: "world",
                                    type: "name"
                                }
                            ]
                        ]
                    }
                }
            ]
        }
    ]
];

export default scheme;