<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

final class DateElement extends AbstractElement
{
    public const FORMAT_Y_M_D = 'Y-m-d';

    private string $format;

    public function setFormat(string $format): self
    {
        $this->format = $format;

        return $this;
    }

    public function render($value): array
    {
        if (null !== $value && !\is_string($value)) {
            $this->throwInvalidValueException();
        }

        return $this->renderBase() + [
            'format' => $this->format,
            'value' => $value,
        ];
    }

    protected function getDataType(): string
    {
        return 'date';
    }
}
