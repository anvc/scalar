<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#"
                xmlns:oac="http://www.openannotation.org/ns/"
                xmlns:shoah="http://tempuri.org/">  
                            
    <!-- Shoah Foundation VHA Online "XML for Scalar" import XSL version 1.1 by Craig Dietrich -->                        
  
  	<!-- Variales -->
  
   	<xsl:variable name="archiveName">
		<xsl:text>Shoah Foundation Institute Visual History Archive</xsl:text>
	</xsl:variable>         
  
  	<!-- Templates -->
  
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="/shoah:Project4ScalarClass//shoah:TestimonyClass" />
		</rdf:RDF>
	</xsl:template>  	
	
	<xsl:template match="/shoah:Project4ScalarClass//shoah:TestimonyClass">	
	
		<xsl:apply-templates select="shoah:Tapes/shoah:TapeClass">
			<xsl:with-param name="TestimonyName" select="shoah:TestimonyName" />
			<xsl:with-param name="IntCode" select="shoah:IntCode" />
			<xsl:with-param name="Language" select="shoah:Language" />
			<xsl:with-param name="Experience" select="shoah:Experience" />
			<xsl:with-param name="ThumbnailUrl" select="shoah:ThumbnailUrl" />
			<xsl:with-param name="Segment" select="shoah:Segment" />
			<xsl:with-param name="InTapeNumber" select="shoah:InTapeNumber" />
			<xsl:with-param name="InTimecode" select="shoah:InTimecode" />
			<xsl:with-param name="OutTapeNumber" select="shoah:OutTapeNumber" />
			<xsl:with-param name="OutTimecode" select="shoah:OutTimecode" />
			<xsl:with-param name="VHAURL" select="shoah:VHAURL" />
		</xsl:apply-templates>
 
	</xsl:template>

	<xsl:template match="*"></xsl:template>
 
  	<xsl:template match="shoah:Tapes/shoah:TapeClass">
  		<xsl:param name="TestimonyName" />
  		<xsl:param name="IntCode" />
  		<xsl:param name="Language" />
  		<xsl:param name="Experience" />
  		<xsl:param name="ThumbnailUrl" />
  		<xsl:param name="Segment" />
  		<xsl:param name="InTapeNumber" />
  		<xsl:param name="InTimecode" />
  		<xsl:param name="OutTapeNumber" />
  		<xsl:param name="OutTimecode" />
  		<xsl:param name="VHAURL" />
  		<rdf:Description rdf:about="{$VHAURL}&amp;TapeNumber={shoah:TapeNumber}">
  			<dcterms:title><xsl:value-of select="$TestimonyName"/><xsl:text> (</xsl:text><xsl:value-of select="shoah:TapeNumber"/><xsl:text>)</xsl:text></dcterms:title> 	
  			<dcterms:description><xsl:value-of select="$TestimonyName"/><xsl:text>, </xsl:text><xsl:value-of select="$Experience"/><xsl:text>, Tape </xsl:text><xsl:value-of select="shoah:TapeNumber"/><xsl:text> (VHA)</xsl:text></dcterms:description>
  			<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
  			<dcterms:identifier><xsl:value-of select="$IntCode"/></dcterms:identifier>
  			<dcterms:language><xsl:value-of select="$Language"/></dcterms:language>
  			<dcterms:subject><xsl:value-of select="normalize-space($Experience)"/></dcterms:subject>
			<art:thumbnail rdf:resource="{$ThumbnailUrl}"></art:thumbnail>
  			<art:filename rdf:resource="{shoah:VideoURL}"></art:filename>
  			<art:sourceLocation rdf:resource="{$VHAURL}&amp;TapeNumber={shoah:TapeNumber}"></art:sourceLocation>
  			<shoah:TapeNumber><xsl:value-of select="shoah:TapeNumber"/></shoah:TapeNumber>
  			<scalar:group><xsl:value-of select="$IntCode"/></scalar:group>
			<xsl:choose>
				<xsl:when test="$InTapeNumber=shoah:TapeNumber">
					<scalar:group_hide_others>1</scalar:group_hide_others>
				</xsl:when>
			</xsl:choose> 			
  		</rdf:Description>
	</xsl:template>		            
        
</xsl:stylesheet>                