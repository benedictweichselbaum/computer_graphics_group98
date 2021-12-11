using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MovePlane : MonoBehaviour
{
    public Rigidbody body;


    // Start is called before the first frame update
    void Start()
    {
        body = gameObject.GetComponent(typeof(Rigidbody)) as Rigidbody;
    }

    // Update is called once per frame
    void Update()
    {
        float vertical = Input.GetAxis("Vertical");
        float horizontal = Input.GetAxis("Horizontal");

        Vector3 bodyPos = body.transform.position;

        Vector3 verticalPushPos;
        Vector3 horizontalPushPos;

        Vector3 pushDirection = transform.TransformDirection(Vector3.down);

        if (vertical != 0) {
            if (vertical > 0) {
                verticalPushPos = transform.TransformPoint(bodyPos + Vector3.forward);
                body.AddForceAtPosition(pushDirection.normalized, verticalPushPos);
            } else if (vertical < 0) {
                verticalPushPos = transform.TransformPoint(bodyPos + Vector3.back);
                body.AddForceAtPosition(pushDirection.normalized, verticalPushPos);
            }
        }

        if (horizontal != 0) {
            if (horizontal > 0) {
            horizontalPushPos = transform.TransformPoint(bodyPos + Vector3.right);
            body.AddForceAtPosition(pushDirection.normalized, horizontalPushPos);
            } else if (horizontal < 0) {
            horizontalPushPos = transform.TransformPoint(bodyPos + Vector3.left);
            body.AddForceAtPosition(pushDirection.normalized, horizontalPushPos);
            }
        }
    }
}
