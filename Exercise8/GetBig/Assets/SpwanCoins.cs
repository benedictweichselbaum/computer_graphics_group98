using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SpwanCoins : MonoBehaviour
{

    public GameObject preFabCoin;
    private GameObject ball;

    // Start is called before the first frame update
    void Start()
    {
        InvokeRepeating("NewCoin", 0.0f, 1.0f);
        ball = GameObject.Find("Ball");
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    void NewCoin()
    {
        Vector3 posVec = new Vector3(Random.Range(-4.0f, 4.0f), Random.Range(0.0f, 3.0f), Random.Range(-4.0f, 4.0f));
        Instantiate(preFabCoin, posVec, Quaternion.Euler(90, 0, 0));
        if (ball.transform.localScale.x > 0.5) ball.transform.localScale *= 0.99f;
    }
}
