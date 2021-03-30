package com.appnoisoi.lite;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import android.util.Log;

public class NotificationEventService extends HeadlessJsTaskService {

    protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        return new HeadlessJsTaskConfig("NotificationEvent",
                extras != null ? Arguments.fromBundle(extras) : Arguments.createMap(), 5000, true);
    }
}