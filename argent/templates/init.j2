{% filter indent(0, first=False) %}
@kernel
def init(self):
    self.core.reset()
    self.core.break_realtime()
    {% for dac in channels['dac'] -%}
    self.{{dac}}.init()
    delay(10*ms)
    {% endfor -%}
    {% for cpld in channels['cpld'] -%}
    self.{{cpld}}.init()
    {% endfor -%}
    {% for dds in channels['dds'] -%}
    self.{{dds}}.init()
    {% endfor -%}
    {% for adc in channels['adc'] -%}
    self.{{adc}}.init()
    {% endfor -%}

    delay(10*ms)
    self.core.break_realtime()
{% endfilter %}
