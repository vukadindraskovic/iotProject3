const mqtt = require('mqtt')
const clientId = 'monitoring'
const username = 'monitoring'
const password = 'monitoring'
const edgexTopic = 'edgex/sensor_value'
let currentState = 'OFF'

const address = 'tcp://broker.hivemq.com:1883'

const mqttClient = mqtt.connect(address, {
    clientId,
    username,
    password
})

mqttClient.subscribe(edgexTopic, () => {
    console.log(`monitoroin service subscribed to ${edgexTopic}`)
})

mqttClient.on('message', (topic, payload) => {
    if (topic !== edgexTopic) return;

    const data = JSON.parse(payload.toString())
    if (data.device !== 'SensorValueCluster2') return;
    const temp = data.readings[0].value
    console.log(`Temperature is ${temp}`)

    if (temp < 30 && currentState === 'OFF')
    {
        currentState = 'ON'
        console.log('CURRENT STATE CHANGED TO ON')
        sendAlert()
        return
    }
    
    if (temp > 40 && currentState === 'ON')
    {
        currentState = 'OFF'
        console.log('CURRENT STATE CHANGED TO OFF')
        sendAlert()
    }
})

async function sendAlert()
{
    const url = 'http://10.66.164.235:48082/api/v1/device/2553a234-031e-42e7-9f06-9d9e3b9fb1be/command/4beb1d8e-bd70-4944-8743-7698221b04e8'
    const body = {
        state: currentState
    }
    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({body})
        })
        console.log(res)
    }
    catch (ex) {
        console.log(ex)
    }
}