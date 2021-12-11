using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MoveCoin : MonoBehaviour
{

    GameObject ball;
    int upDownTranslationCounter;
    int transMode;

    // Start is called before the first frame update
    void Start()
    {
        ball = GameObject.Find("Ball");
        upDownTranslationCounter = 0;
        transMode = Random.value >= 0.5 ? 0 : 1;
    }

    // Update is called once per frame
    void Update()
    {
        gameObject.transform.Rotate(0.0f, 0.0f, 3.0f, Space.Self);
        if (upDownTranslationCounter <= -75) {
            transMode = 0; // UP
        } else if (upDownTranslationCounter >= 75) {
            transMode = 1; // DOWN
        }

        if (transMode == 0) {
            transform.Translate(0, Time.deltaTime, 0, Space.World);
            upDownTranslationCounter++;
        } else {
            transform.Translate(0, -Time.deltaTime, 0, Space.World);
            upDownTranslationCounter--;
        }
    }

    void OnTriggerEnter(Collider other) {
        if (other.gameObject == ball) {
            Destroy(gameObject);
            ball.transform.localScale += new Vector3(0.1f, 0.1f, 0.1f);
        }
    }
}
