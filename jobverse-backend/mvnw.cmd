@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.2.0
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_PSMODULEP_SAVE__=%PSModulePath%
@SET PSModulePath=
@FOR /F "usebackq tokens=1* delims==" %%A IN (`powershell -noprofile "& {$scriptDir='%~dp0telerikfiddler'; $env:JAVA_HOME -replace '\\','/' -replace ':'}'"`") DO @(
  IF "%%A"=="JAVA_HOME" SET "JAVA_HOME=%%B"
)
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE__%

@ECHO OFF
@REM Enable delayed expansion so variables are expanded at runtime
SETLOCAL EnableDelayedExpansion

SET MAVEN_PROJECTBASEDIR=%~dp0
@REM Clean up the path (remove trailing backslash if present)
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%

@REM Find the project home dir
:findBaseDir
IF NOT EXIST "%MAVEN_PROJECTBASEDIR%\.mvn" (
  SET MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%
  FOR /F "delims=" %%A IN ("%MAVEN_PROJECTBASEDIR%") DO SET MAVEN_PROJECTBASEDIR=%%~dpA
  IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%
  IF "%MAVEN_PROJECTBASEDIR%"=="" GOTO error
  GOTO findBaseDir
)

@REM Detect JAVA_HOME
IF NOT "%JAVA_HOME%"=="" (
  SET "JAVACMD=%JAVA_HOME%\bin\java.exe"
  IF NOT EXIST "!JAVACMD!" (
    ECHO ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME% >&2
    ECHO Please set the JAVA_HOME variable in your environment to match the >&2
    ECHO location of your Java installation. >&2
    GOTO error
  )
) ELSE (
  FOR %%I IN (java.exe) DO SET "JAVACMD=%%~$PATH:I"
  IF NOT EXIST "!JAVACMD!" (
    ECHO ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH. >&2
    ECHO Please set the JAVA_HOME variable in your environment to match the >&2
    ECHO location of your Java installation. >&2
    GOTO error
  )
)

@REM Check Maven Wrapper jar
SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
IF NOT EXIST %WRAPPER_JAR% (
  ECHO Downloading Maven Wrapper...
  powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar' -OutFile '%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar' }"
)

@REM Run Maven
"%JAVACMD%" ^
  -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" ^
  -classpath %WRAPPER_JAR% ^
  org.apache.maven.wrapper.MavenWrapperMain %*

IF ERRORLEVEL 1 GOTO error
GOTO end

:error
SET ERROR_CODE=1

:end
@ENDLOCAL & SET ERROR_CODE=%ERROR_CODE%
EXIT /B %ERROR_CODE%
