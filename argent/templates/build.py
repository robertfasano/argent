def build(self):
    self.__pid__ = '{{pid}}'
    self.__cycle__ = 0
    self.setattr_device('core')

    for ttl in {{channels['ttl']}}:
        self.setattr_device(ttl)
    for dac in {{channels['dac']}}:
        self.setattr_device(dac)
    for cpld in {{channels['cpld']}}:
        self.setattr_device(cpld)
    for dds in {{channels['dds']}}:
        self.setattr_device(dds)
    for adc in {{channels['adc']}}:
        self.setattr_device(adc)
    for cam in {{channels['cam']}}:
        self.setattr_device(cam)

    ## parameters
    {% for key, value in parameters.items() -%}
    self.{{key}} = 0.0
    {% endfor %}

    ## variables
    {% for key, value in variables.items() -%}
    self.{{key}} = 0.0
    {% endfor %}

    ## data arrays
    {% for key, value in arrays.items() -%}
    self.{{key}} = {{value}}
    {% endfor %}
