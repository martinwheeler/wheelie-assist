# Bluetooth Notes

Bluetooth operates on the publish/subsribe coding pattern.

There are two distinct items concepts required when trying to subscribe to a bluetooth value.

1. Services
    - A service is a grouping of characteristics that helps to collate values together in a meaningful way.
        - E.g. The down volume button on your bluetooth headphones as it may contain multiple characteristics to trigger different events inside of an application.
            - Double press could be different to single press
2. Characteristics
    - A characteristic is the object that holds a value and also lists what actions can be performed on it.
        - Characteristics can be read or write depending on what has been defined on them.